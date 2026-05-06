'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hexagon, ArrowLeft, Users, Terminal, DollarSign, Database, Activity, AlertTriangle, ShieldAlert, CheckCircle2, PlayCircle, PlusCircle, XCircle, Clock, RefreshCw, QrCode, Rocket, MessageSquareReply, Send } from 'lucide-react'
import Link from 'next/link'
import { db, auth, app } from '../../lib/firebase'
import { collection, doc, updateDoc, onSnapshot, setDoc, arrayUnion } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { initializeApp, getApps } from 'firebase/app'

export default function AdminDashboard() {
    const [qForm, setQForm] = useState({ title: '', description: '', constraints: '', output: '' })
    const [qTrack, setQTrack] = useState('Urban Friction')
    const [teams, setTeams] = useState<any[]>([])
    const [sosTickets, setSosTickets] = useState<any[]>([])

    // SYSTEM CONFIG STATES
    const [eventStarted, setEventStarted] = useState(false)
    const [rouletteUnlocked, setRouletteUnlocked] = useState(false)
    const [metrics, setMetrics] = useState({ totalTeams: 0, pendingTeams: 0, revenue: 0 })

    // CLOCK STATES
    const [clockEndTime, setClockEndTime] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState<string>("24:00:00")

    // Judge Form State
    const [judgeEmail, setJudgeEmail] = useState('')
    const [judgePass, setJudgePass] = useState('')
    const [judgeTrack, setJudgeTrack] = useState('Urban Friction')
    const [judgeAdded, setJudgeAdded] = useState(false)

    // SOS Reply State
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyMessage, setReplyMessage] = useState('')

    useEffect(() => {
        // REAL-TIME: Master Config & Clock
        const unsubConfig = onSnapshot(doc(db, "config", "system"), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data()
                setEventStarted(data.eventStarted || false)
                setRouletteUnlocked(data.rouletteUnlocked || false)
                setClockEndTime(data.clockEndTime || null)
            }
        })

        // REAL-TIME: Teams
        const unsubTeams = onSnapshot(collection(db, "teams"), (snap) => {
            const fetched: any[] = []
            let approved = 0
            let pending = 0
            snap.forEach(doc => {
                const data = doc.data()
                fetched.push({ id: doc.id, ...data })
                if (data.status === 'approved') approved++
                if (data.status === 'pending') pending++
            })
            setTeams(fetched)
            setMetrics({ totalTeams: fetched.length, pendingTeams: pending, revenue: approved * 1000 })
        })

        // REAL-TIME: SOS Tickets
        const unsubSos = onSnapshot(collection(db, "sos_tickets"), (snap) => {
            const tickets: any[] = []
            snap.forEach(doc => { if (doc.data().status === 'active') tickets.push({ id: doc.id, ...doc.data() }) })
            setSosTickets(tickets.sort((a, b) => b.timestamp - a.timestamp))
        })

        return () => { unsubConfig(); unsubTeams(); unsubSos() }
    }, [])

    // CLOCK TICK TICK TICK
    useEffect(() => {
        if (!clockEndTime) {
            setTimeLeft("24:00:00")
            return
        }

        const timer = setInterval(() => {
            const now = Date.now()
            const difference = clockEndTime - now

            if (difference <= 0) {
                setTimeLeft("00:00:00")
                clearInterval(timer)
            } else {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
                const minutes = Math.floor((difference / 1000 / 60) % 60)
                const seconds = Math.floor((difference / 1000) % 60)
                setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [clockEndTime])

    // CLOCK CONTROLS
    const handleStartClock = async () => {
        const endTime = Date.now() + (24 * 60 * 60 * 1000) // 24 Hours from now
        await setDoc(doc(db, "config", "system"), { clockEndTime: endTime }, { merge: true })
    }

    const handleResetClock = async () => {
        if (confirm("Reset the master 24-hour clock? This will stop the countdown.")) {
            await setDoc(doc(db, "config", "system"), { clockEndTime: null }, { merge: true })
        }
    }

    // Approvals
    const handleApproval = async (teamId: string, status: 'approved' | 'rejected') => {
        if (confirm(`Are you sure you want to mark this team as ${status.toUpperCase()}?`)) {
            await updateDoc(doc(db, "teams", teamId), { status })
        }
    }

    // SOS REPLY & RESOLVE
    const resolveSos = async (id: string, withReply: boolean = false) => {
        try {
            const payload: any = { status: 'resolved' }
            if (withReply && replyMessage.trim() !== '') {
                payload.adminReply = replyMessage
            }
            await updateDoc(doc(db, "sos_tickets", id), payload)

            // Clean up state
            setReplyingTo(null)
            setReplyMessage('')
        } catch (error) {
            alert("Failed to resolve ticket.")
        }
    }

    const toggleEventStatus = async () => {
        const newStatus = !eventStarted;
        const msg = newStatus ? "WARNING: This will UNLOCK project submissions for all teams. Proceed?" : "WARNING: This will LOCK project submissions. Proceed?";
        if (confirm(msg)) await setDoc(doc(db, "config", "system"), { eventStarted: newStatus }, { merge: true })
    }

    const toggleRoulette = async () => {
        const newStatus = !rouletteUnlocked;
        const msg = newStatus ? "This will UNLOCK the Question Roulette for all approved teams. Proceed?" : "This will LOCK the Question Roulette. Proceed?";
        if (confirm(msg)) await setDoc(doc(db, "config", "system"), { rouletteUnlocked: newStatus }, { merge: true })
    }

    const handleTransferCaptain = async (teamId: string) => {
        const newLeaderUid = prompt("Enter the UID of the new Captain (must be an existing member's UID):")
        if (!newLeaderUid || !newLeaderUid.trim()) return
        if (confirm("Are you sure you want to transfer captaincy to UID: " + newLeaderUid + "?")) {
            try {
                await updateDoc(doc(db, "teams", teamId), { leaderUid: newLeaderUid.trim() })
                alert("Captaincy transferred successfully.")
            } catch (error) { alert("Failed to transfer captain.") }
        }
    }

    const handleAddJudge = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const shadowAppName = "ShadowApp";
            const shadowApp = getApps().find(a => a.name === shadowAppName) || initializeApp(app.options, shadowAppName);
            const shadowAuth = getAuth(shadowApp);
            const userCredential = await createUserWithEmailAndPassword(shadowAuth, judgeEmail, judgePass);
            const judgeUid = userCredential.user.uid;
            await signOut(shadowAuth);

            await setDoc(doc(db, "users", judgeUid), {
                uid: judgeUid, name: `Judge (${judgeTrack})`, email: judgeEmail, role: 'judge', track: judgeTrack, joinedAt: new Date().toISOString()
            });

            setJudgeAdded(true)
            setJudgeEmail(''); setJudgePass('')
            setTimeout(() => setJudgeAdded(false), 3000)
        } catch (err: any) { alert("Failed to create Judge: " + err.message) }
    }

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await setDoc(doc(db, "track_questions", qTrack), { pool: arrayUnion(qForm) }, { merge: true })
            setQForm({ title: '', description: '', constraints: '', output: '' })
            alert(`Structured Objective locked into the vault for ${qTrack}!`)
        } catch (err) { alert("Failed to add question.") }
    }

    return (
        <main className="relative min-h-screen bg-[#FAFAFA] text-stone-900 py-12 px-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center mb-12">
                <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-white border rounded-full font-bold shadow-sm">
                    <ArrowLeft className="w-5 h-5" /> Base
                </Link>
                <div className="flex items-center gap-2 bg-stone-900 px-6 py-3 rounded-full shadow-lg">
                    <ShieldAlert className="w-5 h-5 text-yellow-400" />
                    <span className="font-black text-lg uppercase text-white">Command Center</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* METRICS & EVENT CONTROL ROW */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white border p-6 rounded-3xl shadow-sm flex flex-col justify-center">
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Active Revenue</p>
                        <p className="text-4xl font-black text-green-500">₹{metrics.revenue}</p>
                        <p className="text-xs font-bold text-stone-400 mt-2">{metrics.pendingTeams} teams pending payment</p>
                    </div>

                    <div className={`md:col-span-2 p-6 rounded-3xl border flex flex-col justify-center gap-4 ${eventStarted ? 'bg-green-50 border-green-200' : 'bg-stone-50 border-stone-200'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black uppercase text-stone-900">{eventStarted ? 'Submissions: UNLOCKED' : 'Submissions: LOCKED'}</h3>
                                <p className="font-medium text-stone-600 text-sm">{eventStarted ? 'Teams can currently upload their project links.' : 'Project uploads are disabled.'}</p>
                            </div>
                            <button onClick={toggleEventStatus} className={`px-6 py-3 font-black uppercase rounded-xl flex items-center gap-2 shadow-sm transition-all ${eventStarted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white animate-pulse'}`}>
                                {eventStarted ? <XCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                                {eventStarted ? 'Lock Submissions' : 'Unlock Submissions'}
                            </button>
                        </div>

                        <div className="border-t border-stone-200/50 pt-4 mt-2 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black uppercase text-stone-900">{rouletteUnlocked ? 'Roulette: ACTIVE' : 'Roulette: LOCKED'}</h3>
                                <p className="font-medium text-stone-600 text-xs">Controls the Gacha question spin on hacker dashboards.</p>
                            </div>
                            <button onClick={toggleRoulette} className={`px-6 py-3 font-black uppercase rounded-xl flex items-center gap-2 shadow-sm transition-all text-sm ${rouletteUnlocked ? 'bg-stone-800 text-white hover:bg-stone-900' : 'bg-white border-2 border-stone-200 text-stone-800 hover:border-stone-400'}`}>
                                {rouletteUnlocked ? 'Lock Roulette' : 'Unlock Roulette'}
                            </button>
                        </div>
                    </div>

                    {/* THE 24 HOUR CLOCK BLOCK */}
                    <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl shadow-lg flex flex-col justify-center items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-400" />
                        <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Event Timer</p>
                        <p className="text-4xl font-mono font-black text-yellow-400 tracking-wider mb-4">{timeLeft}</p>
                        <div className="flex gap-2 w-full">
                            {clockEndTime ? (
                                <button onClick={handleResetClock} className="flex-1 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors">
                                    <RefreshCw className="w-3 h-3" /> Reset
                                </button>
                            ) : (
                                <button onClick={handleStartClock} className="flex-1 py-2 bg-yellow-400 text-stone-900 hover:bg-yellow-500 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors">
                                    <PlayCircle className="w-3 h-3" /> Start 24H Clock
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COL: Verification & Roster */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* PENDING VERIFICATION QUEUE */}
                        {metrics.pendingTeams > 0 && (
                            <div className="bg-white border shadow-sm rounded-3xl overflow-hidden border-orange-200 relative">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-400" />
                                <div className="p-6 border-b border-stone-100 flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                                    <h3 className="font-black text-xl uppercase">Verification Queue ({metrics.pendingTeams})</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    {teams.filter(t => t.status === 'pending').map(team => (
                                        <div key={team.id} className="flex flex-col md:flex-row justify-between items-center bg-stone-50 border p-4 rounded-2xl">
                                            <div className="mb-4 md:mb-0">
                                                <h4 className="font-black text-lg">{team.teamName} <span className="text-sm font-bold text-stone-400 ml-2">({team.track})</span></h4>
                                                <p className="text-sm font-bold text-stone-600 bg-yellow-100 inline-block px-2 py-1 rounded mt-2">UTR: {team.transactionId}</p>
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button onClick={() => handleApproval(team.id, 'rejected')} className="flex-1 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 font-bold rounded-lg uppercase text-sm">Reject</button>
                                                <button onClick={() => handleApproval(team.id, 'approved')} className="flex-1 px-6 py-2 bg-green-500 text-white hover:bg-green-600 font-black rounded-lg uppercase text-sm">Approve</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* MASTER ROSTER */}
                        <div className="bg-white border shadow-sm rounded-3xl overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-stone-900" />
                            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                                <h3 className="font-black text-xl uppercase">Approved Squads</h3>
                                <Link href="/scanner" target="_blank" className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-black uppercase rounded-xl flex items-center gap-2 transition-colors">
                                    <QrCode className="w-4 h-4" /> Open Scanner
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-stone-50">
                                            <th className="p-4 font-bold text-stone-500 text-xs uppercase w-[25%]">Team</th>
                                            <th className="p-4 font-bold text-stone-500 text-xs uppercase w-[20%]">Status</th>
                                            <th className="p-4 font-bold text-stone-500 text-xs uppercase w-[40%]">Gacha Question</th>
                                            <th className="p-4 font-bold text-stone-500 text-xs uppercase text-right w-[15%]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {teams.filter(t => t.status === 'approved').map(team => (
                                            <tr key={team.id}>
                                                <td className="p-4">
                                                    <div className="font-black text-stone-900 text-base">{team.teamName}</div>
                                                    <div className="text-[10px] font-bold text-stone-500 uppercase mt-1">{team.track}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1.5 items-start">
                                                        {team.checkedIn ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded border border-green-200"><CheckCircle2 className="w-3 h-3" /> Checked In</span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-black uppercase rounded border border-stone-200"><AlertTriangle className="w-3 h-3" /> Not Arrived</span>
                                                        )}
                                                        {team.isSubmitted ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded border border-blue-200"><Rocket className="w-3 h-3" /> Deployed</span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-black uppercase rounded border border-stone-200"><Terminal className="w-3 h-3" /> Building...</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-medium text-stone-600 max-w-[200px] truncate">
                                                    {team.assignedQuestion ? (team.assignedQuestion.title || team.assignedQuestion) : "Not Spun Yet"}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => handleTransferCaptain(team.id)} className="px-3 py-1.5 bg-stone-900 text-yellow-400 font-bold text-[10px] uppercase rounded-lg hover:bg-stone-800 transition-colors">Transfer Captain</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL: Judges, Question Vault, & SOS Feed */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* ADD JUDGE PORTAL */}
                        <div className="bg-white border shadow-sm rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500" />
                            <h3 className="font-black text-xl uppercase mb-4">Register Judge</h3>
                            <form onSubmit={handleAddJudge} className="space-y-4">
                                <input type="email" required value={judgeEmail} onChange={(e) => setJudgeEmail(e.target.value)} placeholder="Judge Email" className="w-full p-3 bg-stone-50 border rounded-xl text-sm font-bold outline-none focus:border-blue-400" />
                                <input type="text" required value={judgePass} onChange={(e) => setJudgePass(e.target.value)} placeholder="Assign Password" className="w-full p-3 bg-stone-50 border rounded-xl text-sm font-bold outline-none focus:border-blue-400" />
                                <select value={judgeTrack} onChange={(e) => setJudgeTrack(e.target.value)} className="w-full p-3 bg-stone-50 border rounded-xl text-sm font-bold outline-none focus:border-blue-400">
                                    <option value="Urban Friction">Urban Friction</option>
                                    <option value="Learning Under Constraint">Learning Under Constraint</option>
                                    <option value="Health in the Margins">Health in the Margins</option>
                                    <option value="Money at the Edge">Money at the Edge</option>
                                    <option value="Broken Handoffs">Broken Handoffs</option>
                                    <option value="Digital Overload">Digital Overload</option>
                                </select>
                                <button type="submit" className="w-full py-3 bg-stone-900 text-white font-black uppercase rounded-xl flex justify-center items-center gap-2 hover:bg-stone-800 transition-colors">
                                    {judgeAdded ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <PlusCircle className="w-5 h-5" />}
                                    {judgeAdded ? 'Judge Saved!' : 'Create Access'}
                                </button>
                            </form>
                        </div>

                        {/* DETAILED QUESTION VAULT */}
                        <div className="bg-white border shadow-sm rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
                            <h3 className="font-black text-xl uppercase mb-4">Objective Vault</h3>
                            <form onSubmit={handleAddQuestion} className="space-y-4">
                                <input required value={qForm.title} onChange={(e) => setQForm({ ...qForm, title: e.target.value })} placeholder="Title (e.g. The invisible queue)" className="w-full p-3 bg-stone-50 border rounded-xl text-sm font-bold outline-none focus:border-emerald-400" />
                                <textarea required value={qForm.description} onChange={(e) => setQForm({ ...qForm, description: e.target.value })} placeholder="Full Problem Description..." className="w-full p-3 bg-stone-50 border rounded-xl text-sm font-medium outline-none focus:border-emerald-400 h-24 resize-none" />
                                <textarea required value={qForm.constraints} onChange={(e) => setQForm({ ...qForm, constraints: e.target.value })} placeholder="Constraints (e.g. No QR Codes)" className="w-full p-3 bg-stone-50 border rounded-xl text-sm font-medium outline-none focus:border-emerald-400 h-20 resize-none" />
                                <textarea required value={qForm.output} onChange={(e) => setQForm({ ...qForm, output: e.target.value })} placeholder="Expected MVP Scope / Output" className="w-full p-3 bg-stone-50 border rounded-xl text-sm font-medium outline-none focus:border-emerald-400 h-20 resize-none" />
                                <select value={qTrack} onChange={(e) => setQTrack(e.target.value)} className="w-full p-3 bg-stone-50 border rounded-xl text-sm font-bold outline-none focus:border-emerald-400">
                                    <option value="Urban Friction">Urban Friction</option>
                                    <option value="Learning Under Constraint">Learning Under Constraint</option>
                                    <option value="Health in the Margins">Health in the Margins</option>
                                    <option value="Money at the Edge">Money at the Edge</option>
                                    <option value="Broken Handoffs">Broken Handoffs</option>
                                    <option value="Digital Overload">Digital Overload</option>
                                </select>
                                <button type="submit" className="w-full py-3 bg-stone-900 text-white font-black uppercase rounded-xl hover:bg-stone-800 transition-colors flex justify-center items-center gap-2">
                                    <PlusCircle className="w-5 h-5" /> Inject Objective
                                </button>
                            </form>
                        </div>

                        {/* LIVE SOS FEED WITH REPLY */}
                        <div className="bg-white border shadow-sm rounded-3xl flex flex-col h-[500px] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
                            <div className="p-6 border-b border-stone-100 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                <h3 className="font-black uppercase">Live SOS Pings</h3>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-stone-50/50">
                                {sosTickets.length === 0 ? (
                                    <p className="text-center font-bold text-stone-400 mt-10">No active distress signals.</p>
                                ) : (
                                    sosTickets.map(ticket => (
                                        <div key={ticket.id} className="p-4 bg-white border border-red-200 rounded-2xl shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-black uppercase rounded-md">{ticket.type}</span>
                                                <span className="text-xs font-bold text-stone-400">{new Date(ticket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <h4 className="font-black text-sm mb-1">{ticket.teamName}</h4>
                                            <p className="text-sm font-medium text-stone-600 mb-4">{ticket.message}</p>

                                            {/* REPLY UI */}
                                            {replyingTo === ticket.id ? (
                                                <div className="mt-2 space-y-2">
                                                    <input
                                                        type="text"
                                                        value={replyMessage}
                                                        onChange={(e) => setReplyMessage(e.target.value)}
                                                        placeholder="Type response..."
                                                        className="w-full p-2 text-sm border rounded-lg outline-none focus:border-stone-400"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setReplyingTo(null)} className="flex-1 py-1.5 bg-stone-100 text-stone-600 text-xs font-bold uppercase rounded-md hover:bg-stone-200">Cancel</button>
                                                        <button onClick={() => resolveSos(ticket.id, true)} className="flex-1 py-1.5 bg-stone-900 text-white text-xs font-bold uppercase rounded-md hover:bg-stone-800 flex items-center justify-center gap-1"><Send className="w-3 h-3" /> Send</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button onClick={() => resolveSos(ticket.id)} className="flex-1 py-2 bg-stone-100 hover:bg-green-100 hover:text-green-700 text-stone-600 text-xs font-black uppercase rounded-lg transition-colors">Mark Resolved</button>
                                                    <button onClick={() => setReplyingTo(ticket.id)} className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-black uppercase rounded-lg transition-colors flex justify-center items-center gap-1"><MessageSquareReply className="w-3 h-3" /> Reply</button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    )
}