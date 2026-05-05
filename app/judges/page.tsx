'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight, CheckCircle2, TrendingUp, Trophy } from 'lucide-react'
import Link from 'next/link'
import { auth, db } from '../../lib/firebase'
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

function LiquidAuraBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#FAFAFA]">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='69' viewBox='0 0 40 69' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 11.547v23.094L20 46.188 0 34.641V11.547L20 0zm0 11.547L5.359 20v11.547L20 40.094l14.641-8.547V20L20 11.547z' fill='%23000000' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '40px' }} />
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-yellow-400 rounded-full blur-[120px]" />
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-400 rounded-full blur-[150px]" />
        </div>
    )
}

export default function JudgesPortal() {
    const router = useRouter()

    // Auth & Profile State
    const [isLoading, setIsLoading] = useState(true)
    const [userUid, setUserUid] = useState('')
    const [judgeProfile, setJudgeProfile] = useState<any>(null)

    // Dashboard State
    const [teams, setTeams] = useState<any[]>([])
    const [activeTeam, setActiveTeam] = useState<any>(null)

    // 👇 NEW STATE: Matches your Judging Matrix perfectly (Total: 100)
    const [scores, setScores] = useState({
        problem: 0,       // Max 25
        tech: 0,          // Max 25
        innovation: 0,    // Max 15
        viability: 0,     // Max 10
        presentation: 0,  // Max 10
        demo: 0           // Max 15
    })

    const [isSubmitted, setIsSubmitted] = useState(false)

    // Calculate dynamic total
    const totalScore = scores.problem + scores.tech + scores.innovation + scores.viability + scores.presentation + scores.demo

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) { router.push('/'); return }
            setUserUid(user.uid)

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid))
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    setJudgeProfile(data)
                    // Bypass the Gacha: Immediately load teams for the track Admin assigned
                    fetchTeamsForTrack(data.track)
                }
            } catch (error) { console.error("Error fetching judge data:", error) }
            setIsLoading(false)
        })
        return () => unsubscribe()
    }, [router])

    const fetchTeamsForTrack = async (assignedTrack: string) => {
        try {
            const q = query(collection(db, "teams"), where("track", "==", assignedTrack), where("status", "==", "approved"))
            const snap = await getDocs(q)
            const fetched: any[] = []
            snap.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }))
            setTeams(fetched)
            if (fetched.length > 0) setActiveTeam(fetched[0])
        } catch (error) {
            console.error("Failed to load teams", error)
        }
    }

    const handleLogout = async () => {
        await signOut(auth)
        router.push('/')
    }

    const handleSubmitScore = async () => {
        if (!activeTeam) return

        // Save score to Database
        try {
            await updateDoc(doc(db, "teams", activeTeam.id), {
                totalScore: totalScore,
                detailedScores: scores,
                isScored: true,
                judgedBy: judgeProfile.name
            })

            // Update local state
            setTeams(teams.map(t => t.id === activeTeam.id ? { ...t, isScored: true } : t))
            setIsSubmitted(true)

            setTimeout(() => {
                setIsSubmitted(false)
                // Auto move to next unscored team
                const nextTeam = teams.find(t => t.id !== activeTeam.id && !t.isScored)
                if (nextTeam) setActiveTeam(nextTeam)

                // Reset sliders for next team
                setScores({ problem: 0, tech: 0, innovation: 0, viability: 0, presentation: 0, demo: 0 })
            }, 2000)
        } catch (error) {
            alert("Failed to push score to the mainframe.")
        }
    }

    if (isLoading || !judgeProfile) return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-stone-200 border-t-yellow-400 rounded-full animate-spin" /></div>

    // Helper to safely render the assigned question (fixes the Object crash)
    const renderQuestionTitle = (question: any) => {
        if (!question) return "Not Spun"
        if (typeof question === 'string') return question
        return question.title || "Unknown Objective"
    }

    // ==========================================
    // MAIN JUDGES DASHBOARD
    // ==========================================
    return (
        <main className="relative min-h-screen text-stone-900 py-12 px-6 overflow-hidden">
            <LiquidAuraBackground />

            <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 relative z-20">
                <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-md border border-white/50 rounded-full text-stone-600 font-bold hover:bg-white hover:shadow-lg transition-all"><ArrowLeft className="w-5 h-5" /> Sign Out</button>
                <div className="flex items-center gap-2 bg-stone-900 px-6 py-3 rounded-full shadow-lg"><Trophy className="w-5 h-5 text-yellow-400" /><span className="font-black tracking-tight text-lg uppercase text-white">Judging Matrix</span></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-20 mb-8">
                <h1 className="text-4xl font-black text-stone-900 uppercase tracking-tight">Welcome, {judgeProfile.name}.</h1>
                <p className="text-stone-500 font-medium text-lg flex items-center gap-2 mt-1">You are assigned to evaluate the <span className="font-black text-stone-900 bg-yellow-200 px-2 py-0.5 rounded-md uppercase">{judgeProfile.track}</span> track.</p>
            </div>

            <div className="max-w-6xl mx-auto relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: THE QUEUE */}
                <div className="lg:col-span-1 bg-white/60 backdrop-blur-2xl border border-white/50 shadow-lg rounded-[2rem] overflow-hidden flex flex-col h-[750px]">
                    <div className="p-6 border-b border-stone-200">
                        <h3 className="font-black text-stone-900 text-xl uppercase tracking-tight">Submission Queue</h3>
                    </div>
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                        {teams.length === 0 ? (
                            <p className="text-center font-bold text-stone-400 mt-10">No approved teams in this track yet.</p>
                        ) : (
                            teams.map((team) => (
                                <button
                                    key={team.id}
                                    onClick={() => {
                                        setActiveTeam(team)
                                        // Reset scores when switching teams
                                        setScores({ problem: 0, tech: 0, innovation: 0, viability: 0, presentation: 0, demo: 0 })
                                    }}
                                    className={`w-full text-left p-4 rounded-2xl flex justify-between items-center transition-all ${activeTeam?.id === team.id ? 'bg-stone-900 text-white shadow-md' : 'bg-white/50 hover:bg-white text-stone-900 border border-stone-200'}`}
                                >
                                    <div>
                                        <h4 className={`font-black text-lg ${activeTeam?.id === team.id ? 'text-yellow-400' : 'text-stone-900'}`}>{team.teamName}</h4>
                                        <span className={`text-xs font-bold uppercase ${activeTeam?.id === team.id ? 'text-stone-400' : 'text-stone-500'}`}>{team.isSubmitted ? 'Project Deployed' : 'Building...'}</span>
                                    </div>
                                    {team.isScored ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <ChevronRight className={`w-5 h-5 ${activeTeam?.id === team.id ? 'text-stone-500' : 'text-stone-300'}`} />}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: THE SCORING RUBRIC */}
                <div className="lg:col-span-2 bg-white/60 backdrop-blur-2xl border border-white/50 shadow-lg rounded-[2rem] overflow-hidden relative h-[750px] flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-400" />

                    {!activeTeam ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                            <Trophy className="w-16 h-16 text-stone-300 mb-4" />
                            <h2 className="text-2xl font-black text-stone-400 uppercase tracking-tight">Select a team</h2>
                            <p className="text-stone-500 font-medium">Click a team from the queue to begin grading.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {isSubmitted || activeTeam.isScored ? (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                    </div>
                                    <h2 className="text-4xl font-black text-stone-900 uppercase tracking-tight mb-2">Score Locked</h2>
                                    <p className="text-stone-500 font-bold">Points registered to the mainframe for {activeTeam.teamName}.</p>
                                </motion.div>
                            ) : (
                                <motion.div key="scoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">

                                    {/* HEADER SECTION */}
                                    <div className="p-8 md:px-12 md:pt-12 md:pb-6 border-b border-stone-200 shrink-0">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <h2 className="text-4xl font-black text-stone-900 uppercase tracking-tight mb-2">{activeTeam.teamName}</h2>
                                                {/* 👇 Fix is here. Prevents object rendering crash */}
                                                <span className="inline-flex px-3 py-1 bg-stone-100 text-stone-600 font-bold text-sm uppercase rounded-lg border border-stone-200 truncate max-w-sm">
                                                    Gacha: {renderQuestionTitle(activeTeam.assignedQuestion)}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-stone-500 uppercase tracking-widest block mb-1">Total Score</span>
                                                <div className="text-6xl font-black text-yellow-500 tracking-tighter">{totalScore}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SCROLLABLE CONTENT SECTION */}
                                    <div className="flex-1 overflow-y-auto p-8 md:px-12 pb-12">
                                        {/* ARTIFACTS ZONE */}
                                        {activeTeam.isSubmitted && activeTeam.project && (
                                            <div className="mb-8 p-6 bg-stone-50 rounded-2xl border border-stone-200">
                                                <h4 className="font-black uppercase text-sm mb-4">Submitted Artifacts</h4>
                                                <div className="flex gap-4">
                                                    {activeTeam.project.githubLink && (
                                                        <a href={activeTeam.project.githubLink} target="_blank" className="flex-1 py-3 bg-stone-900 text-white text-center rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors">View GitHub</a>
                                                    )}
                                                    {activeTeam.project.videoLink && (
                                                        <a href={activeTeam.project.videoLink} target="_blank" className="flex-1 py-3 bg-blue-100 text-blue-800 text-center rounded-xl font-bold text-sm hover:bg-blue-200 transition-colors">Watch Demo</a>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-8">
                                            {/* SLIDER 1: Problem Understanding */}
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <label className="font-black text-stone-900 uppercase text-sm">Problem Understanding <span className="text-stone-400">(Max 25)</span></label>
                                                    <span className="font-black text-stone-900">{scores.problem}</span>
                                                </div>
                                                <input type="range" min="0" max="25" value={scores.problem} onChange={(e) => setScores({ ...scores, problem: parseInt(e.target.value) })} className="w-full h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900" />
                                            </div>

                                            {/* SLIDER 2: Technical Implementation */}
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <label className="font-black text-stone-900 uppercase text-sm">Technical Implementation <span className="text-stone-400">(Max 25)</span></label>
                                                    <span className="font-black text-stone-900">{scores.tech}</span>
                                                </div>
                                                <input type="range" min="0" max="25" value={scores.tech} onChange={(e) => setScores({ ...scores, tech: parseInt(e.target.value) })} className="w-full h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900" />
                                            </div>

                                            {/* SLIDER 3: Innovation */}
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <label className="font-black text-stone-900 uppercase text-sm">Innovation <span className="text-stone-400">(Max 15)</span></label>
                                                    <span className="font-black text-stone-900">{scores.innovation}</span>
                                                </div>
                                                <input type="range" min="0" max="15" value={scores.innovation} onChange={(e) => setScores({ ...scores, innovation: parseInt(e.target.value) })} className="w-full h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900" />
                                            </div>

                                            {/* SLIDER 4: Viability */}
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <label className="font-black text-stone-900 uppercase text-sm">Viability <span className="text-stone-400">(Max 10)</span></label>
                                                    <span className="font-black text-stone-900">{scores.viability}</span>
                                                </div>
                                                <input type="range" min="0" max="10" value={scores.viability} onChange={(e) => setScores({ ...scores, viability: parseInt(e.target.value) })} className="w-full h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900" />
                                            </div>

                                            {/* SLIDER 5: Presentation */}
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <label className="font-black text-stone-900 uppercase text-sm">Presentation <span className="text-stone-400">(Max 10)</span></label>
                                                    <span className="font-black text-stone-900">{scores.presentation}</span>
                                                </div>
                                                <input type="range" min="0" max="10" value={scores.presentation} onChange={(e) => setScores({ ...scores, presentation: parseInt(e.target.value) })} className="w-full h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900" />
                                            </div>

                                            {/* SLIDER 6: Demo */}
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <label className="font-black text-stone-900 uppercase text-sm">Demo <span className="text-stone-400">(Max 15)</span></label>
                                                    <span className="font-black text-stone-900">{scores.demo}</span>
                                                </div>
                                                <input type="range" min="0" max="15" value={scores.demo} onChange={(e) => setScores({ ...scores, demo: parseInt(e.target.value) })} className="w-full h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900" />
                                            </div>
                                        </div>

                                        <button onClick={handleSubmitScore} className="w-full mt-10 py-5 bg-yellow-400 text-stone-900 font-black text-lg rounded-2xl hover:bg-yellow-500 transition-colors uppercase tracking-widest flex justify-center items-center gap-2 shadow-[0_8px_30px_rgba(250,204,21,0.3)]">
                                            Lock & Finalize Score <TrendingUp className="w-6 h-6" />
                                        </button>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

            </div>
        </main>
    )
}