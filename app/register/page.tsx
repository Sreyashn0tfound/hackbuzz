'use client'

import React, { useState, useRef, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hexagon, ArrowLeft, ArrowRight, Shield, Cpu, Coins, Palette, Globe, Code2, CheckCircle2, UserPlus, Users, CreditCard, Key, HelpCircle, X, AlertCircle, Building2, GraduationCap, HeartPulse, Wallet, Network, MonitorOff, Info, Clock } from 'lucide-react'
import Link from 'next/link'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Clone, Environment, useAnimations, Float, Sparkles } from '@react-three/drei'
import { db, auth } from '../../lib/firebase'
import { doc, setDoc, getDoc, updateDoc, arrayUnion, collection, getDocs } from 'firebase/firestore'

// ==========================================
// 1. 3D BACKGROUND ENGINE
// ==========================================
function CinematicBee() {
    const { scene, animations } = useGLTF('/minecraft_bee.glb')
    const groupRef = useRef<THREE.Group>(null)
    const { actions, names } = useAnimations(animations, groupRef)

    useEffect(() => {
        scene.traverse((child: any) => {
            if (child.isMesh && child.material && child.material.map) {
                child.material.map.magFilter = THREE.NearestFilter
                child.material.map.minFilter = THREE.NearestFilter
                child.material.map.needsUpdate = true
            }
        })
        if (names.length > 0 && actions[names[0]]) {
            actions[names[0]]?.reset().play()
        }
    }, [scene, actions, names])

    useFrame((state) => {
        if (!groupRef.current) return
        const t = state.clock.getElapsedTime()
        groupRef.current.position.y = Math.sin(t * 1) * 0.4
        groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.2 - 0.2
        groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.1
    })

    return (
        <group ref={groupRef} position={[4, 1, -5]} scale={0.9}>
            <Clone object={scene} />
        </group>
    )
}

function CyberHiveMesh() {
    return (
        <group>
            <Sparkles count={150} scale={15} size={6} speed={0.4} opacity={0.4} color="#FACC15" noise={0.5} />
            <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2} position={[-4, 2, -4]}>
                <mesh rotation={[Math.PI / 2, 0.5, 0]}>
                    <cylinderGeometry args={[1.5, 1.5, 0.05, 6]} />
                    <meshBasicMaterial color="#FACC15" wireframe transparent opacity={0.3} />
                </mesh>
            </Float>
            <Float speed={2} rotationIntensity={1} floatIntensity={3} position={[3, -3, -6]}>
                <mesh rotation={[Math.PI / 3, -0.5, 0.2]}>
                    <cylinderGeometry args={[2, 2, 0.05, 6]} />
                    <meshBasicMaterial color="#FACC15" wireframe transparent opacity={0.2} />
                </mesh>
            </Float>
        </group>
    )
}

// ==========================================
// 2. DOM EFFECTS
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

function HoneyDrips() {
    return (
        <div className="absolute -bottom-6 left-0 w-full flex justify-around px-12 pointer-events-none z-[-1]">
            <motion.div animate={{ y: [0, 15, 0], scaleY: [1, 1.3, 1] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} className="w-6 h-12 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-b-full opacity-90 blur-[1px]" />
            <motion.div animate={{ y: [0, 25, 0], scaleY: [1, 1.6, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="w-8 h-16 bg-gradient-to-b from-yellow-300 to-amber-500 rounded-b-full opacity-80 blur-[1px] mt-2" />
            <motion.div animate={{ y: [0, 10, 0], scaleY: [1, 1.2, 1] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="w-5 h-8 bg-gradient-to-b from-amber-300 to-yellow-400 rounded-b-full opacity-90 blur-[1px]" />
            <motion.div animate={{ y: [0, 30, 0], scaleY: [1, 1.8, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="w-10 h-20 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-b-full opacity-80 blur-[1px] -mt-1" />
            <motion.div animate={{ y: [0, 15, 0], scaleY: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="w-6 h-10 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-b-full opacity-90 blur-[1px]" />
        </div>
    )
}

const tracks = [
    { id: 'Urban Friction', name: "Urban Friction", icon: Building2, color: "text-amber-500", bg: "bg-amber-50", desc: "Solve physical city problems: transit queues, civic reporting, last-mile delivery, and shared infrastructure." },
    { id: 'Learning Under Constraint', name: "Learning Under Constraint", icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50", desc: "Address educational gaps beyond content: offline practice, feedback loops, and resource decay." },
    { id: 'Health in the Margins', name: "Health in the Margins", icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50", desc: "Bridge the gap between hospital and home: caregiver burnout, prescription literacy, and recovery." },
    { id: 'Money at the Edge', name: "Money at the Edge", icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-50", desc: "Build informal finance tools: gig income tracking, kirana ledgers, and shared expense settlement." },
    { id: 'Broken Handoffs', name: "Broken Handoffs", icon: Network, color: "text-purple-500", bg: "bg-purple-50", desc: "Fix information lost between people or systems: shift changes, event briefings, and maintenance tickets." },
    { id: 'Digital Overload', name: "Digital Overload", icon: MonitorOff, color: "text-cyan-500", bg: "bg-cyan-50", desc: "Design solutions for subtraction: compressing newsletters, auditing meetings, and tool sprawl." },
]

// ==========================================
// 3. MAIN REGISTRATION COMPONENT
// ==========================================
export default function RegisterPage() {
    const [flow, setFlow] = useState<'none' | 'create' | 'join'>('none')
    const [step, setStep] = useState(1)
    const [isDesktop, setIsDesktop] = useState(true)
    const [showInstructions, setShowInstructions] = useState(false)

    // Form & Database State
    const [teamCode, setTeamCode] = useState('')
    const [teamName, setTeamName] = useState('')
    const [selectedTrack, setSelectedTrack] = useState('')
    const [personalDetails, setPersonalDetails] = useState({ name: '', college: '', phone: '', email: '' })
    const [generatedCode, setGeneratedCode] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    // Track Capacity & Total Limits
    const [trackCounts, setTrackCounts] = useState<Record<string, number>>({})
    const [totalTeamsCount, setTotalTeamsCount] = useState(0)

    useEffect(() => {
        const checkMobile = () => setIsDesktop(window.innerWidth > 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        const fetchTrackData = async () => {
            try {
                const snap = await getDocs(collection(db, "teams"));
                const counts: Record<string, number> = {};
                let total = 0;
                snap.forEach(doc => {
                    const trackId = doc.data().track;
                    counts[trackId] = (counts[trackId] || 0) + 1;
                    total++;
                });
                setTrackCounts(counts);
                setTotalTeamsCount(total);
            } catch (error) {
                console.error("Failed to load track capacities", error);
            }
        };
        fetchTrackData();

        // Pre-fill email

    }, [])

    const handleRegistration = async () => {
        setIsProcessing(true)
        try {
            let finalCode = "";

            if (flow === 'create') {
                finalCode = "HV-" + Math.random().toString(36).substring(2, 6).toUpperCase()
                setGeneratedCode(finalCode)

                await setDoc(doc(db, "teams", finalCode), {
                    teamName,
                    track: selectedTrack,
                    members: [personalDetails],
                    createdAt: new Date().toISOString(),
                    status: 'approved', // Auto-Approved instantly!
                    leaderUid: auth.currentUser?.uid || ""
                })
            } else if (flow === 'join') {
                const teamRef = doc(db, "teams", teamCode)
                const teamSnap = await getDoc(teamRef)

                if (!teamSnap.exists()) {
                    alert("Invalid Team Code! Check with your Captain.")
                    setIsProcessing(false)
                    return
                }

                if (teamSnap.data().members && teamSnap.data().members.length >= 4) {
                    alert("Registration Failed: This team already has the maximum of 4 members.")
                    setIsProcessing(false)
                    return
                }

                await updateDoc(teamRef, {
                    members: arrayUnion(personalDetails)
                })
                finalCode = teamCode;
                setGeneratedCode(finalCode)
            }

            if (auth.currentUser) {
                await setDoc(doc(db, "users", auth.currentUser.uid), {
                    teamCode: finalCode
                }, { merge: true })
            } else {
                console.error("CRITICAL: User lost auth state during registration.")
            }

            setStep(3) // Straight to the Success Page!
        } catch (error) {
            console.error(error)
            alert("Hive connection failed!")
        }
        setIsProcessing(false)
    }

    const activeTrackInfo = tracks.find(t => t.id === selectedTrack)

    return (
        <main className="relative min-h-screen text-stone-900 py-12 px-6 overflow-hidden">
            <LiquidAuraBackground />

            {/* 3D Canvas Background */}
            {isDesktop && (
                <div className="fixed inset-0 z-0 pointer-events-none opacity-80">
                    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                        <ambientLight intensity={2.5} color="#ffffff" />
                        <directionalLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
                        <Suspense fallback={null}>
                            <CinematicBee />
                            <CyberHiveMesh />
                        </Suspense>
                        <Environment preset="city" />
                    </Canvas>
                </div>
            )}

            {/* TOP NAVIGATION & HELP BUTTON */}
            <div className="max-w-4xl mx-auto flex justify-between items-center mb-12 relative z-20">
                <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-md border border-white/50 rounded-full text-stone-600 font-bold hover:bg-white hover:shadow-lg hover:text-stone-900 transition-all">
                    <ArrowLeft className="w-5 h-5" /> Base
                </Link>

                <div className="flex gap-3">
                    <button onClick={() => setShowInstructions(true)} className="flex items-center gap-2 bg-stone-900 px-5 py-3 rounded-full shadow-lg text-yellow-400 font-bold hover:bg-stone-800 transition-colors">
                        <HelpCircle className="w-5 h-5" />
                        <span className="hidden sm:inline">How to Register</span>
                    </button>
                    <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-white/50 px-5 py-3 rounded-full shadow-lg">
                        <Hexagon className="w-5 h-5 text-yellow-500" fill="currentColor" />
                        <span className="font-black tracking-tight text-lg uppercase text-stone-900 hidden sm:inline">HACKBUZZ</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto relative z-20">
                <motion.div className="bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] relative" layout>
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 rounded-t-[2rem]" />

                    <div className="p-8 md:p-12 relative z-10 bg-white/40 rounded-[2rem]">
                        <AnimatePresence mode="wait">

                            {/* STEP 0: FORK IN THE ROAD */}
                            {flow === 'none' && (
                                <motion.div key="fork" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div className="mb-10 text-center">
                                        <h1 className="text-4xl md:text-5xl font-black text-stone-900 uppercase tracking-tight mb-2">Join the Hive</h1>
                                        <p className="text-stone-600 font-medium">Are you establishing a new squad or joining an existing one?</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <button
                                            disabled={totalTeamsCount >= 36}
                                            onClick={() => { if (totalTeamsCount < 36) { setFlow('create'); setStep(1) } }}
                                            className={`group relative p-8 backdrop-blur-sm border rounded-3xl transition-all text-left overflow-hidden ${totalTeamsCount >= 36 ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed' : 'bg-white/50 border-white/60 hover:bg-white/80 hover:shadow-xl hover:-translate-y-1'}`}
                                        >
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-transform ${totalTeamsCount >= 36 ? 'bg-stone-200 border-stone-300' : 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300 group-hover:scale-110'}`}>
                                                <UserPlus className={`w-7 h-7 ${totalTeamsCount >= 36 ? 'text-stone-400' : 'text-yellow-600'}`} />
                                            </div>
                                            <h2 className={`text-2xl font-black uppercase mb-2 ${totalTeamsCount >= 36 ? 'text-stone-500' : 'text-stone-900'}`}>Create Team</h2>
                                            <p className="text-stone-500 font-medium text-sm">
                                                {totalTeamsCount >= 36 ? 'Registration Full. Maximum 36 teams reached.' : 'Pick your track and generate a secure invite code for your squad. Tracks are strictly First-Come, First-Serve!'}
                                            </p>
                                        </button>

                                        <button onClick={() => { setFlow('join'); setStep(1) }} className="group relative p-8 bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-stone-900 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                                            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 border border-stone-200 group-hover:scale-110 transition-transform"><Users className="w-7 h-7 text-stone-600" /></div>
                                            <h2 className="text-2xl font-black text-stone-900 uppercase mb-2">Join Team</h2>
                                            <p className="text-stone-500 font-medium text-sm">Connect your profile using the 6-digit code provided by your Captain.</p>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 1A: CREATE TEAM */}
                            {flow === 'create' && step === 1 && (
                                <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h1 className="text-3xl font-black text-stone-900 uppercase tracking-tight mb-2">Establish Squad</h1>
                                    <p className="text-stone-500 font-medium mb-6">Set your team name and target sector to initialize the database.</p>

                                    {/* FIRST COME FIRST SERVE WARNING */}
                                    <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-2xl mb-8 flex items-start gap-3 shadow-sm">
                                        <Clock className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-black text-yellow-800 uppercase tracking-wide text-sm mb-1">⚠️ First-Come, First-Serve</h3>
                                            <p className="text-yellow-700 text-xs font-bold leading-relaxed">
                                                Each theme is strictly capped at a maximum of 6 teams. Once a track hits its capacity, it will be locked and permanently disabled. Move fast.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider">Team Designation</label>
                                            <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Cyber Hornets" className="w-full px-5 py-4 bg-white/70 backdrop-blur-md border border-stone-200 rounded-2xl outline-none focus:border-yellow-400 focus:bg-white focus:shadow-[0_8px_30px_rgba(250,204,21,0.15)] transition-all font-bold text-stone-900 text-lg placeholder:text-stone-300" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider">Select Theme</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {tracks.map((track) => {
                                                    const count = trackCounts[track.id] || 0;
                                                    const isFull = count >= 6; // Locks it out instantly at 6 teams

                                                    return (
                                                        <div
                                                            key={track.id}
                                                            onClick={() => !isFull && setSelectedTrack(track.id)}
                                                            className={`relative overflow-hidden border p-4 rounded-2xl flex flex-col justify-center transition-all ${isFull
                                                                ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed grayscale'
                                                                : selectedTrack === track.id
                                                                    ? 'cursor-pointer border-yellow-400 bg-white shadow-md'
                                                                    : 'cursor-pointer border-white/60 bg-white/40 hover:bg-white/80 hover:border-stone-200'
                                                                }`}
                                                        >
                                                            {selectedTrack === track.id && !isFull && <div className="absolute left-0 top-0 w-1 h-full bg-yellow-400" />}

                                                            <div className="flex items-center justify-between w-full">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-3 rounded-xl ${isFull ? 'bg-stone-300' : track.bg}`}>
                                                                        <track.icon className={`w-6 h-6 ${isFull ? 'text-stone-500' : track.color}`} />
                                                                    </div>
                                                                    <span className={`font-bold ${isFull ? 'text-stone-500 line-through' : selectedTrack === track.id ? 'text-stone-900' : 'text-stone-600'}`}>
                                                                        {track.name}
                                                                    </span>
                                                                </div>
                                                                {isFull && (
                                                                    <span className="text-[10px] font-black uppercase bg-stone-300 text-stone-600 px-2 py-1 rounded-md tracking-wider">Filled</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            {/* INTEL DROP BOX */}
                                            <AnimatePresence>
                                                {activeTrackInfo && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                                        className="mt-4 overflow-hidden"
                                                    >
                                                        <div className="p-4 bg-stone-900 rounded-2xl flex gap-3 border border-stone-800 shadow-inner">
                                                            <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                                                            <div>
                                                                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Theme Intel: {activeTrackInfo.name}</h4>
                                                                <p className="text-stone-400 text-sm font-medium leading-relaxed">
                                                                    {activeTrackInfo.desc}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button onClick={() => setFlow('none')} className="px-6 py-4 bg-white border border-stone-200 text-stone-600 font-bold rounded-2xl hover:bg-stone-50 transition-colors">Back</button>
                                            <button disabled={!teamName || !selectedTrack} onClick={() => setStep(2)} className="flex-1 py-4 bg-stone-900 text-yellow-400 font-black text-lg rounded-2xl hover:bg-stone-800 transition-colors uppercase tracking-widest disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg">
                                                Next Step <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 1B: JOIN TEAM */}
                            {flow === 'join' && step === 1 && (
                                <motion.div key="join" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h1 className="text-3xl font-black text-stone-900 uppercase tracking-tight mb-2">Enter Access Code</h1>
                                    <p className="text-stone-500 font-medium mb-8">Paste the 6-character code provided by your Captain.</p>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider flex items-center gap-2"><Key className="w-4 h-4 text-yellow-500" /> Team Code</label>
                                            <input type="text" value={teamCode} onChange={(e) => setTeamCode(e.target.value.toUpperCase())} placeholder="HV-XXXX" className="w-full px-5 py-6 bg-white/70 backdrop-blur-md border border-stone-200 rounded-2xl outline-none focus:border-yellow-400 focus:bg-white focus:shadow-[0_8px_30px_rgba(250,204,21,0.15)] transition-all font-black text-stone-900 text-3xl tracking-[0.5em] text-center placeholder:text-stone-300 placeholder:tracking-normal" maxLength={7} />
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button onClick={() => setFlow('none')} className="px-6 py-4 bg-white border border-stone-200 text-stone-600 font-bold rounded-2xl hover:bg-stone-50 transition-colors">Back</button>
                                            <button disabled={teamCode.length < 5} onClick={() => setStep(2)} className="flex-1 py-4 bg-stone-900 text-yellow-400 font-black text-lg rounded-2xl hover:bg-stone-800 transition-colors uppercase tracking-widest disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg">
                                                Verify Code <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: PERSONAL DETAILS */}
                            {step === 2 && (
                                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h1 className="text-3xl font-black text-stone-900 uppercase tracking-tight mb-2">Hacker Profile</h1>
                                    <p className="text-stone-500 font-medium mb-8">We need your specific details for the ID badge and urgent comms.</p>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider">Full Name</label>
                                                <input type="text" value={personalDetails.name} onChange={(e) => setPersonalDetails({ ...personalDetails, name: e.target.value })} placeholder="John Doe" className="w-full px-5 py-4 bg-white/70 border border-stone-200 rounded-2xl outline-none focus:border-yellow-400 focus:bg-white transition-all font-bold text-stone-900" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider">Email Address</label>
                                                <input type="email" value={personalDetails.email} onChange={(e) => setPersonalDetails({ ...personalDetails, email: e.target.value })} placeholder="john@college.edu" className="w-full px-5 py-4 bg-white/70 border border-stone-200 rounded-2xl outline-none focus:border-yellow-400 focus:bg-white transition-all font-bold text-stone-900" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider">Phone Number</label>
                                                <input type="tel" value={personalDetails.phone} onChange={(e) => setPersonalDetails({ ...personalDetails, phone: e.target.value })} placeholder="+91 9999999999" className="w-full px-5 py-4 bg-white/70 border border-stone-200 rounded-2xl outline-none focus:border-yellow-400 focus:bg-white transition-all font-bold text-stone-900" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-stone-500 uppercase mb-3 tracking-wider">College</label>
                                                <input type="text" value={personalDetails.college} onChange={(e) => setPersonalDetails({ ...personalDetails, college: e.target.value })} placeholder="MIT" className="w-full px-5 py-4 bg-white/70 border border-stone-200 rounded-2xl outline-none focus:border-yellow-400 focus:bg-white transition-all font-bold text-stone-900" />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button onClick={() => setStep(1)} className="px-6 py-4 bg-white border border-stone-200 text-stone-600 font-bold rounded-2xl hover:bg-stone-50 transition-colors">Back</button>

                                            <button
                                                disabled={!personalDetails.name || !personalDetails.college || !personalDetails.phone || !personalDetails.email || isProcessing}
                                                onClick={handleRegistration} // Directly calls the DB now
                                                className="flex-1 py-4 bg-stone-900 text-yellow-400 font-black text-lg rounded-2xl hover:bg-stone-800 transition-colors uppercase tracking-widest disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg"
                                            >
                                                {isProcessing ? 'Deploying...' : (flow === 'create' ? 'Initialize Squad' : 'Join Team Now')} <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: SUCCESS PAGE */}
                            {step === 3 && (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">

                                    {flow === 'create' ? (
                                        <>
                                            <div className="mx-auto w-24 h-24 bg-green-100 border border-green-200 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
                                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                                            </div>
                                            <h1 className="text-4xl md:text-5xl font-black text-stone-900 uppercase tracking-tight mb-6">Squad Initialized</h1>
                                            <p className="text-stone-600 font-medium text-lg mb-6 max-w-md mx-auto">
                                                Your team is live on the Hive servers. Send this code to your squad so they can join <span className="text-stone-900 font-bold">{teamName}</span>.
                                            </p>
                                            <div className="inline-block px-12 py-6 bg-stone-50 border border-stone-200 rounded-3xl mb-8 relative overflow-hidden">
                                                <div className="absolute left-0 top-0 w-1.5 h-full bg-yellow-400" />
                                                <p className="text-stone-900 font-black text-5xl tracking-[0.3em]">{generatedCode}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="mx-auto w-24 h-24 bg-green-100 border border-green-200 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
                                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                                            </div>
                                            <h1 className="text-5xl font-black text-stone-900 uppercase tracking-tight mb-8">Access Granted</h1>
                                            <p className="text-stone-600 font-medium text-lg mb-10 max-w-md mx-auto">
                                                You have officially joined Team <span className="text-stone-900 font-bold">{generatedCode}</span>.
                                            </p>
                                        </>
                                    )}

                                    <div>
                                        <Link href="/dashboard" className="inline-block px-10 py-5 bg-stone-900 text-yellow-400 font-black text-lg rounded-2xl hover:bg-stone-800 transition-colors uppercase tracking-widest shadow-lg">
                                            Enter Dashboard
                                        </Link>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                    <HoneyDrips />
                </motion.div>
            </div>

            {/* INSTRUCTIONS MODAL */}
            <AnimatePresence>
                {showInstructions && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-3xl p-8 max-w-md w-full relative">
                            <button onClick={() => setShowInstructions(false)} className="absolute top-6 right-6 p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors">
                                <X className="w-5 h-5 text-stone-600" />
                            </button>

                            <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                                <HelpCircle className="w-6 h-6 text-yellow-500" /> How to Register
                            </h2>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-stone-900 text-yellow-400 flex items-center justify-center font-black shrink-0">1</div>
                                    <div>
                                        <h3 className="font-bold text-stone-900">Captain Creates Team</h3>
                                        <p className="text-sm text-stone-500">One person acts as the captain. They pick the track and fill out their details to generate an invite code. Tracks are First-Come, First-Serve!</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-stone-900 text-yellow-400 flex items-center justify-center font-black shrink-0">2</div>
                                    <div>
                                        <h3 className="font-bold text-stone-900">Share the Code</h3>
                                        <p className="text-sm text-stone-500">The Captain receives a 6-digit Hive Code (e.g., HV-A9X2). Send this to your teammates.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-stone-900 text-yellow-400 flex items-center justify-center font-black shrink-0">3</div>
                                    <div>
                                        <h3 className="font-bold text-stone-900">Hackers Join</h3>
                                        <p className="text-sm text-stone-500">Teammates click "Join Team", enter the code, and are instantly added to the roster.</p>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setShowInstructions(false)} className="w-full mt-8 py-4 bg-yellow-400 text-stone-900 font-black rounded-xl hover:bg-yellow-500 transition-colors">
                                Got it
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </main>
    )
}