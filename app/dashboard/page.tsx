'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hexagon, ArrowLeft, ArrowRight, Terminal, Users, Cpu, Clock, Rocket, Bell, Code, Link as LinkIcon, CheckCircle2, Headset, Send, Crown, AlertCircle, XCircle, FileText, Layers, Bot, Video, Dices, Lock, Building2, GraduationCap, HeartPulse, Wallet, Network, MonitorOff, Unlock, Activity, QrCode } from 'lucide-react'
import Link from 'next/link'
import { auth, db } from '../../lib/firebase'
import { doc, getDoc, updateDoc, onSnapshot, addDoc, collection, arrayRemove } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

// ==========================================
// 1. SHARED BACKGROUND ENGINE
// ==========================================
function LiquidAuraBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#FAFAFA]">
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='69' viewBox='0 0 40 69' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 11.547v23.094L20 46.188 0 34.641V11.547L20 0zm0 11.547L5.359 20v11.547L20 40.094l14.641-8.547V20L20 11.547z' fill='%23000000' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    backgroundSize: '40px'
                }}
            />
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-yellow-400 rounded-full blur-[120px]" />
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-400 rounded-full blur-[150px]" />
        </div>
    )
}

// ==========================================
// 2. MAIN DASHBOARD COMPONENT
// ==========================================
export default function HackerDashboard() {
    const router = useRouter()

    // Database States
    const [isLoading, setIsLoading] = useState(true)
    const [teamInfo, setTeamInfo] = useState<any>(null)
    const [teamCode, setTeamCode] = useState<string>('')
    const [userName, setUserName] = useState<string>('')
    const [userUid, setUserUid] = useState<string>('')

    // Submission Form States
    const [projectName, setProjectName] = useState('')
    const [projectDetails, setProjectDetails] = useState('')
    const [techStack, setTechStack] = useState('')
    const [aiUsage, setAiUsage] = useState('')
    const [githubLink, setGithubLink] = useState('')
    const [videoLink, setVideoLink] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)

    // SOS Beacon State
    const [sosType, setSosType] = useState<'Mentor' | 'Tech' | 'Facilities'>('Mentor')
    const [sosMessage, setSosMessage] = useState('')
    const [isSosSent, setIsSosSent] = useState(false)

    // Gambling/Roulette States
    const [isSpinning, setIsSpinning] = useState(false)
    const [currentSpinText, setCurrentSpinText] = useState("???")

    // Admin Master Control States
    const [submissionsUnlocked, setSubmissionsUnlocked] = useState(false)
    const [rouletteUnlocked, setRouletteUnlocked] = useState(false)

    // Clock States
    const [clockEndTime, setClockEndTime] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState<string>("24:00:00")
    const [timeAngles, setTimeAngles] = useState({ h: 0, m: 0, s: 0 })

    // FETCH DATA FROM FIREBASE ON LOAD
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/')
                return
            }
            setUserUid(user.uid)

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid))
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    setUserName(data.name)

                    if (data.teamCode) {
                        const code = data.teamCode
                        setTeamCode(code)

                        const teamDoc = await getDoc(doc(db, "teams", code))
                        if (teamDoc.exists()) {
                            setTeamInfo(teamDoc.data())
                            if (teamDoc.data().isSubmitted) setIsSubmitted(true)
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching hive data:", error)
            }
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [router])

    // LISTEN FOR ADMIN MASTER LOCKS & CLOCK
    useEffect(() => {
        const unsubConfig = onSnapshot(doc(db, "config", "system"), (snap) => {
            if (snap.exists()) {
                const data = snap.data()
                setSubmissionsUnlocked(data.eventStarted || false)
                setRouletteUnlocked(data.rouletteUnlocked || false)
                setClockEndTime(data.clockEndTime || null)
            }
        })
        return () => unsubConfig()
    }, [])

    // THE 24-HOUR CLOCK ENGINE
    useEffect(() => {
        if (!clockEndTime) {
            setTimeLeft("24:00:00")
            setTimeAngles({ h: 0, m: 0, s: 0 })
            return
        }

        const timer = setInterval(() => {
            const now = Date.now()
            const difference = clockEndTime - now

            if (difference <= 0) {
                setTimeLeft("00:00:00")
                setTimeAngles({ h: 0, m: 0, s: 0 })
                clearInterval(timer)
            } else {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
                const minutes = Math.floor((difference / 1000 / 60) % 60)
                const seconds = Math.floor((difference / 1000) % 60)

                setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)

                // Calculate sweeping angles for the analog clock
                const sDeg = (seconds / 60) * 360
                const mDeg = (minutes / 60) * 360
                const hDeg = ((hours % 12) / 12) * 360 + (minutes / 60) * 30

                setTimeAngles({ h: hDeg, m: mDeg, s: sDeg })
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [clockEndTime])

    const handleLogout = async () => {
        await signOut(auth)
        router.push('/')
    }

    const handleSubmission = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm("Are you sure? You cannot edit this once submitted.")) return

        try {
            await updateDoc(doc(db, "teams", teamCode), {
                isSubmitted: true,
                project: {
                    name: projectName,
                    details: projectDetails,
                    techStack: techStack,
                    aiUsage: aiUsage,
                    githubLink: githubLink,
                    videoLink: videoLink,
                    submittedAt: new Date().toISOString()
                }
            })
            setIsSubmitted(true)
        } catch (error) {
            console.error("Submission failed:", error)
            alert("Failed to submit project. Please ping an admin.")
        }
    }

    const handleSosSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await addDoc(collection(db, "sos_tickets"), {
                teamId: teamCode,
                teamName: teamInfo.teamName,
                type: sosType,
                message: sosMessage,
                status: 'active',
                timestamp: Date.now()
            })
            setIsSosSent(true)
            setSosMessage('')
            setTimeout(() => setIsSosSent(false), 5000)
        } catch (error) {
            console.error("SOS failed:", error)
            alert("Failed to send beacon. Check your connection.")
        }
    }

    const handleSpinWheel = async () => {
        if (!isLeader) return alert("Only the Captain can draw.")
        setIsSpinning(true)

        try {
            const qDoc = await getDoc(doc(db, "track_questions", teamInfo.track))

            if (!qDoc.exists() || !qDoc.data().pool || qDoc.data().pool.length === 0) {
                alert("No problem statements available for this track! Ping the Admins.")
                setIsSpinning(false)
                return
            }

            const livePool = qDoc.data().pool

            let counter = 0
            const spinInterval = setInterval(() => {
                const item = livePool[counter++ % livePool.length]
                setCurrentSpinText(typeof item === 'string' ? item : item.title || "???")
            }, 80)

            setTimeout(async () => {
                clearInterval(spinInterval)

                const finalQuestion = livePool[Math.floor(Math.random() * livePool.length)]
                setCurrentSpinText(typeof finalQuestion === 'string' ? finalQuestion : finalQuestion.title)

                try {
                    await updateDoc(doc(db, "teams", teamCode), { assignedQuestion: finalQuestion })
                    await updateDoc(doc(db, "track_questions", teamInfo.track), {
                        pool: arrayRemove(finalQuestion)
                    })
                    setTeamInfo((prev: any) => ({ ...prev, assignedQuestion: finalQuestion }))
                } catch (err) {
                    alert("Network error locking in question. Ping Admins.")
                }
                setIsSpinning(false)
            }, 3500)

        } catch (error) {
            console.error(error)
            alert("Database connection failed.")
            setIsSpinning(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <div className="w-16 h-16 border-4 border-stone-200 border-t-yellow-400 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!teamInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6 text-center">
                <LiquidAuraBackground />
                <div className="relative z-10 bg-white/60 backdrop-blur-2xl p-12 rounded-[2rem] border border-white/50 shadow-xl max-w-lg">
                    <Hexagon className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-stone-900 uppercase mb-4">No Squad Detected</h1>
                    <p className="text-stone-500 font-medium mb-8">You are authenticated, but you haven't created or joined a team yet.</p>
                    <Link href="/register" className="block w-full py-4 bg-stone-900 text-yellow-400 font-black rounded-xl hover:bg-stone-800 transition-colors uppercase">
                        Go to Registration
                    </Link>
                </div>
            </div>
        )
    }

    const leaderName = teamInfo.members?.[0]?.name || ''
    const isLeader = userUid === teamInfo.leaderUid
    const emptySlots = Array(Math.max(0, 4 - (teamInfo.members?.length || 0))).fill("Waiting...")

    const qrPayload = encodeURIComponent(JSON.stringify({ code: teamCode, team: teamInfo.teamName, track: teamInfo.track }))
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrPayload}&color=1c1917&bgcolor=ffffff&qzone=1`

    return (
        <main className="relative min-h-screen text-stone-900 py-12 px-6 overflow-hidden">
            <LiquidAuraBackground />

            {/* TOP NAVIGATION */}
            <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 relative z-20">
                <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-md border border-white/50 rounded-full text-stone-600 font-bold hover:bg-white hover:shadow-lg hover:text-stone-900 transition-all">
                    <ArrowLeft className="w-5 h-5" /> Sign Out
                </button>
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-white/50 px-5 py-3 rounded-full shadow-lg">
                    <Hexagon className="w-5 h-5 text-yellow-500" fill="currentColor" />
                    <span className="font-black tracking-tight text-lg uppercase text-stone-900">HACKER HUB</span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto relative z-20">

                {/* TEAM APPROVAL STATUS BANNER */}
                {teamInfo.status === 'pending' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-orange-50 border border-orange-200 rounded-3xl flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-orange-100 rounded-2xl"><AlertCircle className="w-8 h-8 text-orange-600" /></div>
                        <div>
                            <h3 className="font-black text-stone-900 uppercase text-lg">Verification Pending</h3>
                            <p className="text-stone-600 font-medium text-sm">Your squad is under review by the Hive Admins.</p>
                        </div>
                    </motion.div>
                )}

                {/* WELCOME BANNER */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
                    <h1 className="text-4xl font-black text-stone-900 uppercase tracking-tight">Welcome back, {userName ? userName.split(' ')[0] : 'Hacker'}.</h1>
                    <p className="text-stone-500 font-medium text-lg">Your workspace is primed. The hive is waiting.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN (Timeline, Comms & SOS) */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* CYBER-CORE ANALOG CLOCK */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-stone-900 border border-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-[2rem] p-8 relative overflow-hidden text-center flex flex-col items-center">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-400" />
                            <h3 className="font-black text-stone-400 uppercase tracking-widest mb-8 text-sm flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-400" /> Hacking Phase Timer
                            </h3>

                            {/* The Analog Dial */}
                            <div className="relative w-48 h-48 rounded-full border-4 border-stone-800 bg-stone-950 flex items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.8),_0_0_20px_rgba(250,204,21,0.15)]">

                                {/* Inner Rotating Cyber Grid */}
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute inset-2 border-[1px] border-dashed border-stone-700/50 rounded-full" />
                                <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute inset-5 border-[2px] border-dotted border-yellow-900/30 rounded-full" />

                                {/* Clock Markers */}
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * 30}deg)` }}>
                                        <div className="mx-auto w-1 h-3 bg-stone-700 mt-2 rounded-full" />
                                    </div>
                                ))}

                                {/* Center Node */}
                                <div className="absolute w-4 h-4 bg-yellow-400 rounded-full z-20 shadow-[0_0_15px_#facc15]" />

                                {/* Hour Hand (Short, thick) */}
                                <div className="absolute w-full h-full z-10 transition-transform duration-500 ease-linear" style={{ transform: `rotate(${timeAngles.h}deg)` }}>
                                    <div className="mx-auto w-2 h-14 bg-stone-400 mt-10 rounded-full shadow-md" />
                                </div>

                                {/* Minute Hand (Long, yellow glow) */}
                                <div className="absolute w-full h-full z-10 transition-transform duration-500 ease-linear" style={{ transform: `rotate(${timeAngles.m}deg)` }}>
                                    <div className="mx-auto w-1.5 h-20 bg-yellow-400 mt-4 rounded-full shadow-[0_0_12px_#facc15]" />
                                </div>

                                {/* Second Hand (Longest, thin red sweep) */}
                                <div className="absolute w-full h-full z-10 transition-transform duration-500 ease-linear" style={{ transform: `rotate(${timeAngles.s}deg)` }}>
                                    <div className="mx-auto w-0.5 h-24 bg-red-500 mt-0 rounded-full shadow-[0_0_8px_#ef4444]" />
                                </div>
                            </div>

                            {/* Digital Terminal Readout */}
                            <div className="mt-8 bg-black py-3 px-6 rounded-2xl border border-stone-800 inline-block shadow-inner w-full">
                                <span className="font-mono font-black text-3xl text-yellow-400 tracking-[0.1em]">{timeLeft}</span>
                            </div>

                            {!clockEndTime && <p className="text-[10px] text-stone-500 mt-4 uppercase font-bold tracking-widest animate-pulse">Awaiting Server Sync...</p>}
                        </motion.div>

                        {/* EVENT STATUS CARD */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] p-8 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-full h-1.5 ${submissionsUnlocked ? 'bg-green-500' : 'bg-stone-900'}`} />
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-stone-100 rounded-xl"><Activity className="w-6 h-6 text-stone-900" /></div>
                                <h3 className="font-black text-stone-900 uppercase">Submission Status</h3>
                            </div>

                            {submissionsUnlocked ? (
                                <div className="text-center py-6 bg-green-50 rounded-2xl border border-green-200">
                                    <Unlock className="w-8 h-8 text-green-500 mx-auto mb-2 animate-pulse" />
                                    <h2 className="text-2xl font-black text-green-600 uppercase tracking-widest">Portal Live</h2>
                                    <p className="font-bold text-green-700 uppercase tracking-widest text-[10px] mt-1">Deploy Your Artifacts</p>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-stone-100 rounded-2xl border border-stone-200">
                                    <Lock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                                    <h2 className="text-xl font-black text-stone-500 uppercase tracking-widest">Standby Mode</h2>
                                    <p className="font-bold text-stone-400 uppercase tracking-widest text-[10px] mt-1">Awaiting Admin Unlock</p>
                                </div>
                            )}
                        </motion.div>

                        {/* HIVE SOS (SUPPORT BEACON) */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-red-500" />
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-orange-100 rounded-xl"><Headset className="w-6 h-6 text-orange-600" /></div>
                                <h3 className="font-black text-stone-900 uppercase">SOS Beacon</h3>
                            </div>

                            {isSosSent ? (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 bg-green-50/50 rounded-2xl border border-green-100">
                                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                    <p className="font-bold text-stone-900 text-sm">Beacon Transmitted.</p>
                                    <p className="text-stone-500 text-xs mt-1">An organizer is looking at it.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSosSubmit} className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Mentor', 'Tech', 'Facilities'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setSosType(type as any)}
                                                className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${sosType === type ? 'bg-stone-900 text-yellow-400 border-stone-900' : 'bg-white/50 text-stone-500 border-stone-200 hover:border-stone-400'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={sosMessage}
                                        onChange={(e) => setSosMessage(e.target.value)}
                                        placeholder="Briefly describe the issue..."
                                        required
                                        className="w-full px-4 py-3 bg-white/70 border border-stone-200 rounded-xl outline-none focus:border-orange-400 transition-all font-medium text-stone-900 text-sm resize-none h-24"
                                    />
                                    <button type="submit" className="w-full py-3 bg-stone-900 text-white font-black text-sm rounded-xl hover:bg-stone-800 transition-colors uppercase tracking-widest flex justify-center items-center gap-2">
                                        Ping Admins <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            )}
                        </motion.div>

                    </div>

                    {/* RIGHT COLUMN (Roster, Gacha & Submission) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* TEAM ROSTER & QR NODE */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-300 to-amber-500" />

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-stone-900 rounded-2xl"><Terminal className="w-8 h-8 text-yellow-400" /></div>
                                    <div>
                                        <h2 className="text-3xl font-black text-stone-900 uppercase tracking-tight">{teamInfo.teamName}</h2>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full mt-1 uppercase">
                                            <Cpu className="w-3 h-3" /> {teamInfo.track}
                                        </span>
                                    </div>
                                </div>

                                {/* NEW QR CODE ID BLOCK FOR DAY 1 SCANNING */}
                                <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm w-full md:w-auto">
                                    <div className="shrink-0 p-1 bg-stone-100 rounded-xl">
                                        <img src={qrUrl} alt="Team QR" className="w-16 h-16 rounded-lg mix-blend-multiply" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black text-stone-400 uppercase tracking-wider mb-0.5">Invite / Access Code</span>
                                        <span className="font-black text-stone-900 text-xl tracking-[0.1em]">{teamCode}</span>
                                        <span className="block text-[10px] font-bold text-stone-500 mt-1 flex items-center gap-1"><QrCode className="w-3 h-3" /> Scan at Registration</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {teamInfo.members?.map((member: any, i: number) => (
                                    <div key={i} className={`relative p-4 rounded-2xl border ${i === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white/80 border-stone-100'} shadow-sm text-center`}>
                                        {i === 0 && <Crown className="absolute top-3 right-3 w-4 h-4 text-yellow-500" />}
                                        <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-yellow-100`}>
                                            <Users className={`w-5 h-5 text-yellow-600`} />
                                        </div>
                                        <span className={`font-bold text-sm text-stone-900 block truncate`}>{member.name}</span>
                                        <span className="text-xs text-stone-500 truncate block mt-0.5">{member.college}</span>
                                    </div>
                                ))}
                                {emptySlots.map((placeholder, i) => (
                                    <div key={`empty-${i}`} className={`p-4 rounded-2xl border bg-white/40 border-stone-200 border-dashed text-center`}>
                                        <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-stone-100`}>
                                            <Users className={`w-5 h-5 text-stone-300`} />
                                        </div>
                                        <span className={`font-bold text-sm text-stone-400`}>{placeholder}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* DETAILED GACHA / ROULETTE CARD */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-400 to-indigo-500" />

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-purple-100 rounded-xl"><Dices className="w-6 h-6 text-purple-600" /></div>
                                <h3 className="font-black text-stone-900 uppercase">The Problem Roulette</h3>
                            </div>

                            {teamInfo.assignedQuestion ? (
                                // STATE: ALREADY DRAWN (DETAILED VIEW)
                                <div className="bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 rounded-2xl border border-yellow-200 shadow-[inset_0_2px_10px_rgba(255,255,255,0.5),_0_10px_20px_rgba(217,119,6,0.3)] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

                                    <div className="p-6 relative z-10 border-b border-white/20">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Lock className="w-4 h-4 text-stone-900/60" />
                                            <span className="font-black text-stone-900/60 uppercase text-xs tracking-wider">Locked Objective</span>
                                        </div>
                                        <h4 className="text-2xl font-black text-stone-900 drop-shadow-sm leading-tight">
                                            {typeof teamInfo.assignedQuestion === 'string' ? teamInfo.assignedQuestion : teamInfo.assignedQuestion.title}
                                        </h4>
                                    </div>

                                    {/* EXPANDED DETAILS (Only if it's an object) */}
                                    {typeof teamInfo.assignedQuestion === 'object' && (
                                        <div className="p-6 bg-white/90 backdrop-blur-sm space-y-4">
                                            <div className="space-y-1">
                                                <h5 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">The Problem</h5>
                                                <p className="text-sm font-medium text-stone-800 leading-relaxed">{teamInfo.assignedQuestion.description}</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                                                    <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Constraints</h5>
                                                    <p className="text-xs font-bold text-stone-600 whitespace-pre-wrap">{teamInfo.assignedQuestion.constraints}</p>
                                                </div>
                                                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                                                    <h5 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Expected Output</h5>
                                                    <p className="text-xs font-bold text-stone-600 whitespace-pre-wrap">{teamInfo.assignedQuestion.output}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : !rouletteUnlocked ? (
                                // STATE: LOCKED BY ADMIN
                                <div className="text-center py-10 bg-stone-100/80 rounded-3xl border border-stone-200">
                                    <Lock className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-black text-stone-500 uppercase mb-1">Roulette Locked</h3>
                                    <p className="text-stone-400 font-medium text-sm max-w-sm mx-auto">The Admins will unlock the problem roulette once the opening ceremony concludes.</p>
                                </div>
                            ) : (
                                // STATE: NEEDS TO DRAW & UNLOCKED
                                <div className="text-center p-8 bg-stone-50 border border-stone-200 rounded-2xl">
                                    {isSpinning ? (
                                        <div className="py-8 bg-white border border-stone-200 rounded-xl shadow-inner mb-6 overflow-hidden">
                                            <AnimatePresence mode="popLayout">
                                                <motion.h2
                                                    key={currentSpinText}
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -20, opacity: 0 }}
                                                    transition={{ duration: 0.1 }}
                                                    className="text-2xl font-black text-stone-400 uppercase tracking-tight px-4"
                                                >
                                                    {currentSpinText}
                                                </motion.h2>
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <div className="mb-6">
                                            <Dices className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                                            <h3 className="text-2xl font-black text-stone-900 uppercase">Draw Your Fate</h3>
                                            <p className="text-stone-500 font-medium">Click to draw a unique problem statement from the {teamInfo.track} pool. Once drawn, it cannot be changed.</p>
                                        </div>
                                    )}

                                    {!isSpinning && (
                                        <button
                                            onClick={handleSpinWheel}
                                            className={`px-8 py-4 font-black text-lg rounded-xl uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 mx-auto ${isLeader
                                                ? 'bg-purple-600 hover:bg-purple-700 text-white hover:-translate-y-1'
                                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <Dices className="w-6 h-6" /> Spin The Wheel
                                        </button>
                                    )}
                                    {!isLeader && !isSpinning && (
                                        <p className="text-xs font-bold text-stone-400 mt-4 uppercase tracking-widest flex items-center justify-center gap-2">
                                            <Crown className="w-4 h-4" /> Only the captain can draw
                                        </p>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* PROJECT SUBMISSION PORTAL */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-stone-900" />

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-stone-100 rounded-xl"><Rocket className="w-6 h-6 text-stone-900" /></div>
                                <h3 className="font-black text-stone-900 uppercase">Deployment Node</h3>
                            </div>

                            {isSubmitted ? (
                                <div className="text-center py-12 bg-green-50/50 rounded-3xl border border-green-100">
                                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-2xl font-black text-stone-900 uppercase mb-2">Project Deployed</h3>
                                    <p className="text-stone-500 font-medium">Your repo and live link have been locked in for judging.</p>
                                </div>
                            ) : !submissionsUnlocked ? (
                                // STATE: LOCKED BY ADMIN
                                <div className="text-center py-10 bg-stone-50/50 rounded-3xl border border-stone-200 border-dashed">
                                    <Lock className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-black text-stone-400 uppercase mb-1">Submissions Locked</h3>
                                    <p className="text-stone-400 font-medium text-sm max-w-sm mx-auto">The project upload portal will be unlocked by admins near the end of the hacking phase.</p>
                                </div>
                            ) : !isLeader ? (
                                // NON-LEADER VIEW
                                <div className="text-center py-10 bg-stone-50/50 rounded-3xl border border-stone-200 border-dashed">
                                    <Crown className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-black text-stone-900 uppercase mb-1">Access Restricted</h3>
                                    <p className="text-stone-500 font-medium text-sm max-w-sm mx-auto">Only the Team Captain <span className="font-bold text-stone-900">({leaderName})</span> can submit the final project details.</p>
                                </div>
                            ) : (
                                // CAPTAIN'S VIEW (FULL FORM)
                                <form onSubmit={handleSubmission} className="space-y-6">

                                    <div>
                                        <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Project Name
                                        </label>
                                        <input type="text" required value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. HiveMind AI" className="w-full px-5 py-4 bg-white/70 border border-stone-200 rounded-2xl outline-none focus:border-yellow-400 transition-all font-bold text-stone-900" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider flex items-center gap-2">
                                            <Layers className="w-4 h-4" /> Project Details & Problem Solved
                                        </label>
                                        <textarea required value={projectDetails} onChange={(e) => setProjectDetails(e.target.value)} placeholder="Explain what it does and why it matters..." className="w-full px-5 py-4 bg-white/70 border border-stone-200 rounded-2xl outline-none focus:border-yellow-400 transition-all font-medium text-stone-900 h-32 resize-none" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider flex items-center gap-2">
                                            <Cpu className="w-4 h-4" /> Tech Stack Used
                                        </label>
                                        <input type="text" required value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="e.g. Next.js, Firebase, Python, OpenCV" className="w-full px-5 py-4 bg-white/70 border border-stone-200 rounded-2xl outline-none focus:border-yellow-400 transition-all font-medium text-stone-900" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider flex items-center gap-2">
                                            <Bot className="w-4 h-4" /> Use of AI (Be Transparent)
                                        </label>
                                        <textarea required value={aiUsage} onChange={(e) => setAiUsage(e.target.value)} placeholder="Did you use ChatGPT, Copilot, or Claude? How?" className="w-full px-5 py-4 bg-white/70 border border-stone-200 rounded-2xl outline-none focus:border-yellow-400 transition-all font-medium text-stone-900 h-24 resize-none" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider flex items-center gap-2">
                                                <Code className="w-4 h-4" /> GitHub Repository
                                            </label>
                                            <input type="url" required value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="https://github.com/..." className="w-full px-5 py-4 bg-white/70 border border-stone-200 rounded-2xl outline-none focus:border-yellow-400 transition-all font-medium text-stone-900" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider flex items-center gap-2">
                                                <Video className="w-4 h-4" /> Video Demo Link
                                            </label>
                                            <input type="url" required value={videoLink} onChange={(e) => setVideoLink(e.target.value)} placeholder="YouTube / Drive Link" className="w-full px-5 py-4 bg-white/70 border border-stone-200 rounded-2xl outline-none focus:border-yellow-400 transition-all font-medium text-stone-900" />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full py-5 bg-stone-900 text-yellow-400 font-black text-lg rounded-2xl hover:bg-stone-800 transition-colors uppercase tracking-widest flex justify-center items-center gap-2 shadow-lg mt-4">
                                        Lock In Submission <ArrowRight className="w-5 h-5" />
                                    </button>
                                </form>
                            )}
                        </motion.div>

                    </div>
                </div>
            </div>
        </main>
    )
}