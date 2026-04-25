'use client'

import { useRouter } from 'next/navigation'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import React, { useRef, useState, useEffect, Suspense } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Clone, Environment, useAnimations } from '@react-three/drei'
import { Hexagon, ArrowRight, Sparkles, Code2, Cpu, Shield, Coins, Palette, Globe, ScrollText, X, CheckCircle2, ChevronDown, Clock, MapPin, Mail, Key, Gavel, Lightbulb, Presentation, UserCheck, PhoneCall, Building2, GraduationCap, HeartPulse, Wallet, Network, MonitorOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ==========================================
// 1. DESKTOP 3D COMPONENT (SWEPT FLIGHT PATHS)
// ==========================================
function SingleBee({ initialPos, scale, baseRotation, speed, radius, timeOffset }: any) {
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
  }, [scene])

  useEffect(() => {
    if (names.length > 0) {
      const action = actions[names[0]]
      if (action) {
        action.reset().play()
        action.time = Math.random() * action.getClip().duration
      }
    }
  }, [actions, names])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime() + timeOffset
    groupRef.current.position.x = initialPos[0] + Math.sin(t * speed) * radius
    groupRef.current.position.z = initialPos[2] + Math.cos(t * speed * 0.8) * radius
    groupRef.current.position.y = initialPos[1] + Math.sin(t * speed * 1.5) * (radius * 0.3)
    groupRef.current.rotation.y = baseRotation[1] + Math.cos(t * speed) * 0.5
    groupRef.current.rotation.z = Math.cos(t * speed) * 0.2
  })

  return (
    <group ref={groupRef}>
      <Clone object={scene} scale={scale} rotation={baseRotation} />
    </group>
  )
}

function MinecraftSwarm() {
  const swarmRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!swarmRef.current) return
    swarmRef.current.position.x = THREE.MathUtils.lerp(swarmRef.current.position.x, state.pointer.x * 2, 0.05)
    swarmRef.current.position.y = THREE.MathUtils.lerp(swarmRef.current.position.y, state.pointer.y * 2, 0.05)
  })
  return (
    <group ref={swarmRef}>
      <SingleBee initialPos={[-5, 2, -10]} scale={0.35} baseRotation={[0.2, 0.5, -0.1]} speed={0.4} radius={4} timeOffset={0} />
      <SingleBee initialPos={[4, -1, -6]} scale={0.25} baseRotation={[-0.2, -0.8, 0.2]} speed={0.6} radius={3} timeOffset={100} />
      <SingleBee initialPos={[-2, -2, -3]} scale={0.30} baseRotation={[0.5, 1.2, -0.2]} speed={0.5} radius={5} timeOffset={50} />
      <SingleBee initialPos={[2, 3, -12]} scale={0.10} baseRotation={[0, -0.5, 0]} speed={0.8} radius={6} timeOffset={200} />
    </group>
  )
}

function HoneycombCSS() {
  return (
    <div className="fixed inset-0 opacity-[0.03] pointer-events-none -z-10"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='69' viewBox='0 0 40 69' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 11.547v23.094L20 46.188 0 34.641V11.547L20 0zm0 11.547L5.359 20v11.547L20 40.094l14.641-8.547V20L20 11.547z' fill='%23000000' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '40px'
      }}
    />
  )
}

// ==========================================
// 2. PURE CODE 3D HONEY COUNTDOWN
// ==========================================
function LiveCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const targetDate = new Date('May 7, 2026 09:00:00').getTime()
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const difference = targetDate - now
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      } else {
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto mt-8">
      {Object.entries(timeLeft).map(([unit, value], i) => (
        <div key={unit} className="relative drop-shadow-[0_15px_15px_rgba(217,119,6,0.4)]">
          <div style={{ filter: 'url(#goo)' }} className="relative h-full">
            <div className="relative flex flex-col items-center justify-center p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-b from-[#FDE047] via-[#F59E0B] to-[#D97706] shadow-[inset_0_6px_12px_rgba(255,255,255,0.8),inset_0_-8px_20px_rgba(146,64,14,0.8)] z-10 h-full">
              <span className="text-5xl md:text-7xl font-black text-stone-900 tracking-tighter relative z-20">
                {value.toString().padStart(2, '0')}
              </span>
              <span className="text-sm md:text-base font-black text-stone-900/80 uppercase mt-2 relative z-20">
                {unit}
              </span>
            </div>
            {/* The Drips */}
            <motion.div animate={{ y: [0, 5, 0], scaleY: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }} className="absolute top-[80%] left-[20%] w-5 h-16 bg-gradient-to-b from-[#D97706] to-[#B45309] rounded-b-full z-0" />
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }} className="absolute top-[calc(80%+4rem)] left-[20%] w-5 h-5 bg-[#B45309] rounded-full z-0" />
            <motion.div animate={{ y: [0, 8, 0], scaleY: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.4 }} className="absolute top-[80%] left-[60%] w-6 h-20 bg-gradient-to-b from-[#D97706] to-[#92400E] rounded-b-full z-0" />
            <motion.div animate={{ y: [0, 3, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }} className="absolute top-[80%] left-[80%] w-4 h-10 bg-gradient-to-b from-[#D97706] to-[#B45309] rounded-b-full z-0" />
          </div>
          <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-white/50 to-transparent rounded-t-[2.5rem] z-30 pointer-events-none" />
        </div>
      ))}
    </div>
  )
}

// ==========================================
// 3. PAGE COMPONENTS & NEW SECTIONS
// ==========================================

// ==========================================
// 3. PAGE COMPONENTS & NEW SECTIONS
// ==========================================

function FlipCard({ track }: { track: any }) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="relative w-full h-full cursor-pointer perspective-1000 group"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)} // For mobile tap support
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT OF CARD */}
        <div className={`absolute inset-0 backface-hidden flex items-center gap-4 p-5 rounded-[1.5rem] bg-stone-100 border border-stone-200/50 shadow-sm group-hover:shadow-md transition-all overflow-hidden`}>
          {/* Animated Hover Glow */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${track.bg.replace('bg-', 'from-').replace('50', '200')} to-transparent`} />

          <div className="p-3 bg-white rounded-xl relative z-10 shadow-sm">
            <track.icon className={`w-6 h-6 ${track.color}`} />
          </div>
          <div className="flex-1 relative z-10">
            <span className="font-black text-stone-900 text-sm drop-shadow-sm block">{track.name}</span>
            <span className="text-[10px] font-bold uppercase text-stone-400 mt-0.5 block tracking-wider group-hover:text-stone-500 transition-colors">Hover for Intel</span>
          </div>
        </div>

        {/* BACK OF CARD (THE INTEL DROP) */}
        <div
          className={`absolute inset-0 backface-hidden p-5 rounded-[1.5rem] bg-stone-900 border border-stone-700 shadow-xl overflow-hidden flex flex-col justify-center`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          {/* Subtle Honeycomb overlay on the back */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='34.5' viewBox='0 0 40 69' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 11.547v23.094L20 46.188 0 34.641V11.547L20 0zm0 11.547L5.359 20v11.547L20 40.094l14.641-8.547V20L20 11.547z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <track.icon className={`w-4 h-4 ${track.color}`} />
              <span className={`text-xs font-black uppercase tracking-wider ${track.color}`}>{track.name}</span>
            </div>
            <p className="text-stone-300 font-medium text-xs leading-relaxed">
              {track.desc}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function BentoGrid() {
  const tracks = [
    { id: 'urban', name: "Urban Friction", icon: Building2, color: "text-amber-500", bg: "bg-amber-50", desc: "Solve physical city problems: transit queues, civic reporting, last-mile delivery, and shared infrastructure." },
    { id: 'learning', name: "Learning Under Constraint", icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50", desc: "Address educational gaps beyond content: offline practice, feedback loops, and resource decay." },
    { id: 'health', name: "Health in the Margins", icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50", desc: "Bridge the gap between hospital and home: caregiver burnout, prescription literacy, and recovery." },
    { id: 'money', name: "Money at the Edge", icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-50", desc: "Build informal finance tools: gig income tracking, kirana ledgers, and shared expense settlement." },
    { id: 'handoffs', name: "Broken Handoffs", icon: Network, color: "text-purple-500", bg: "bg-purple-50", desc: "Fix information lost between people or systems: shift changes, event briefings, and maintenance tickets." },
    { id: 'digital', name: "Digital Overload", icon: MonitorOff, color: "text-cyan-500", bg: "bg-cyan-50", desc: "Design solutions for subtraction: compressing newsletters, auditing meetings, and tool sprawl." },
  ]

  return (
    <div className="relative w-full max-w-7xl mx-auto px-6 py-24 pointer-events-auto" id="tracks-section">
      <div className="mb-12 text-center">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-stone-900 mb-4">THE HIVE <span className="text-yellow-400">BLUEPRINT</span></h2>
        <p className="text-stone-600 font-bold text-lg drop-shadow-sm">Pick your track. Build the future.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
        {/* THE FLIPPING TRACKS CONTAINER */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-white/80 backdrop-blur-md border-2 border-stone-100 rounded-3xl p-8 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-400 rounded-xl"><Hexagon className="w-6 h-6 text-stone-900" fill="currentColor" /></div>
            <h3 className="text-2xl font-black text-stone-900 uppercase">The 6 Tracks</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {tracks.map((track, i) => (
              // Injecting the custom 3D component
              <FlipCard key={i} track={track} />
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 bg-stone-900 rounded-3xl p-8 shadow-xl text-white flex flex-col justify-center relative overflow-hidden border-2 border-stone-800">
          <h3 className="text-2xl font-black text-yellow-400 uppercase mb-4 z-10">The Hive Facilities</h3>
          <ul className="space-y-3 z-10 text-stone-300 font-medium text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-yellow-400" /> Snacks & Refreshments</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-yellow-400" /> Midnight Gaming Sessions</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-yellow-400" /> Dedicated Silent Rest Zone</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="relative col-span-1 md:col-span-3 lg:col-span-2 row-span-1 bg-gradient-to-br from-[#FDE047] via-[#F59E0B] to-[#D97706] rounded-3xl p-8 shadow-[inset_0_6px_12px_rgba(255,255,255,0.8),inset_0_-8px_20px_rgba(146,64,14,0.8)] border border-yellow-200/50 flex flex-col justify-center items-center text-center overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-white/50 to-transparent rounded-t-3xl pointer-events-none" />
          <h3 className="text-xl font-black text-stone-900/80 uppercase mb-2 relative z-10">Total Prize Pool</h3>
          <div className="text-6xl font-black text-stone-900 tracking-tighter drop-shadow-md relative z-10">₹30,000</div>
          <p className="mt-3 font-bold text-stone-900/80 relative z-10">Split across overall winners & track specialists.</p>
        </motion.div>
      </div>
    </div>
  )
}

function GuidelinesSection() {
  const rules = [
    "A team must consist of 2 to 4 members.",
    "Registrations will be accepted on a first-come, first-served basis.",
    "The theme and problem statement will be decided by the college.",
    "Projects must be built from scratch during the 24-hour hackathon period.",
    "The use of open-source libraries and APIs is permitted.",
    "Inter-college teams are welcome to participate.",
    "Participants must bring their own laptops, chargers, and equipment.",
    "Decision of the judges will be final and binding."
  ]

  return (
    <div className="relative w-full bg-stone-900 text-white py-24 px-6 z-20 pointer-events-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">THE <span className="text-yellow-400">PROTOCOL</span></h2>
          <p className="text-stone-400 font-bold text-lg uppercase tracking-widest">Code of Engagement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-stone-800/50 p-6 md:p-12 rounded-[2rem] border border-stone-700">
          {rules.map((rule, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-stone-800/50 border border-stone-700/50 hover:border-yellow-400/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-yellow-400 flex items-center justify-center font-black shrink-0 border border-stone-700">{i + 1}</div>
              <p className="text-stone-300 font-medium text-sm md:text-base leading-relaxed pt-1">{rule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function JudgingCriteriaSection() {
  const criteria = [
    { title: "Problem Understanding", desc: "Clarity of problem statement, understanding of requirements.", pts: 25, icon: Lightbulb, color: "text-blue-500" },
    { title: "Technical Implementation", desc: "Code quality, architecture, tools, and technical depth.", pts: 25, icon: Code2, color: "text-red-500" },
    { title: "Innovation", desc: "Originality, creativity, and uniqueness of the solution.", pts: 15, icon: Sparkles, color: "text-purple-500" },
    { title: "Viability", desc: "Practicality, scalability, and real-world applicability.", pts: 10, icon: Globe, color: "text-green-500" },
    { title: "Presentation", desc: "Clarity of pitch, communication, and explanation.", pts: 10, icon: Presentation, color: "text-pink-500" },
    { title: "Demo", desc: "Functionality, completeness, and effectiveness of the demo.", pts: 15, icon: CheckCircle2, color: "text-yellow-500" }
  ]

  return (
    <div className="relative w-full max-w-7xl mx-auto px-6 py-24 z-20 pointer-events-auto">
      <div className="mb-16 text-center">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-stone-900 mb-4 flex items-center justify-center gap-4">
          <Gavel className="w-10 h-10 md:w-14 md:h-14 text-yellow-500" /> JUDGING <span className="text-yellow-400">MATRIX</span>
        </h2>
        <p className="text-stone-600 font-medium text-lg max-w-2xl mx-auto">Transparent evaluation framework designed to reward innovation, technical excellence, and real-world impact.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {criteria.map((item, i) => (
          <div key={i} className="p-8 bg-white border-2 border-stone-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl bg-stone-50 border border-stone-100 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-stone-900 text-yellow-400 text-xs font-black rounded-full uppercase tracking-wider">{item.pts} PTS</span>
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-2">{item.title}</h3>
            <p className="text-stone-500 font-medium text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactSection() {
  const admins = [
    { role: "Core Maintainer", name: "Sreyash Ranjan", phone: "+91 70206 72841" },
    { role: "Core Maintainer", name: "Shreyes Simha J.R", phone: "+91 63601 97882" },
    { role: "Hacker Ops", name: "Anas Mirza Baig", phone: "+91 63661 72452" },
    { role: "Hacker Ops", name: "Sachin S", phone: "+91 89715 28764" }
  ]

  return (
    <div className="relative w-full bg-stone-50 border-t border-stone-200 py-24 px-6 z-20 pointer-events-auto">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-stone-900 mb-12">ESTABLISH <span className="text-yellow-400">COMMS</span></h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {admins.map((person, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm hover:border-yellow-400 transition-colors">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-4">{person.role}</span>
              <h3 className="text-xl font-black text-stone-900 mb-6">{person.name}</h3>
              <div className="inline-flex items-center gap-2 text-stone-600 font-medium bg-stone-50 px-4 py-2 rounded-xl">
                <PhoneCall className="w-4 h-4 text-yellow-500" /> {person.phone}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScheduleTimeline() {
  const schedule = [
    { time: "Day 1 - 09:00 AM", title: "Check-In & Swag Drop", desc: "Arrive at the hive. Get your ID badges, stickers , and find your workstation." },
    { time: "Day 1 - 11:00 AM", title: "Opening Ceremony", desc: "Keynote speakers, track deep-dives, and the official 24-hour countdown begins." },
    { time: "Day 1 - 01:00 PM", title: "Lunch Phase", desc: "Fuel up. High-protein, heavy carbs. The building phase continues." },
    { time: "Day 1 - 06:00 PM", title: "Mentor Check-in #1", desc: "Professional mentors will walk around the floor to unstuck your code and validate ideas." },
    { time: "Day 2 - 02:00 AM", title: "Midnight Gaming Session", desc: "Take a break from coding and join our midnight gaming session to reset your brains." },
    { time: "Day 2 - 11:00 AM", title: "Hacking Concludes", desc: "Keyboards down. GitHub repos locked. Prepare your pitch decks." },
    { time: "Day 2 - 01:00 PM", title: "Judging & Closing", desc: "Live pitches, demo evaluations, and the ₹30,000 prize distribution." }
  ]

  return (
    <div className="relative w-full max-w-5xl mx-auto px-6 py-24 z-20 pointer-events-auto">
      <div className="mb-16 text-center">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-stone-900 mb-4">THE <span className="text-yellow-400">TIMELINE</span></h2>
        <p className="text-stone-600 font-bold text-lg">24 hours of pure building. Here is how it goes down.</p>
      </div>

      <div className="relative border-l-4 border-yellow-400/30 ml-4 md:ml-12 space-y-12">
        {schedule.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: i * 0.1 }} className="relative pl-8 md:pl-12">
            <div className="absolute -left-[11px] top-2 w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
            <div className="bg-white/80 backdrop-blur-md border-2 border-stone-100 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all hover:border-yellow-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-sm font-bold mb-4">
                <Clock className="w-4 h-4 text-yellow-500" /> {item.time}
              </div>
              <h3 className="text-2xl font-black text-stone-900 mb-2 uppercase">{item.title}</h3>
              <p className="text-stone-500 font-medium">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function RegistrationFeeSection() {
  return (
    <div className="relative w-full bg-[#fde047] border-y border-stone-200 py-24 px-6 z-20 pointer-events-auto">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(250,204,21,0.3)] border-2 border-yellow-300 relative overflow-hidden group">
        <div className="flex-1 text-center md:text-left mb-8 md:mb-0 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-stone-900 text-sm font-bold mb-4 border border-yellow-200">
            <Coins className="w-4 h-4 text-yellow-500" /> SECURE YOUR SPOT
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-stone-900 mb-4">REGISTRATION <span className="text-yellow-500">FEE</span></h2>
          <p className="text-stone-600 font-medium text-lg">One flat fee for the entire team. Access to the hive, snacks, and a shot at the ₹30,000 prize pool.</p>
        </div>
        <div className="shrink-0 relative z-10 flex flex-col items-center ml-0 md:ml-8">
          <div className="text-6xl md:text-8xl font-black text-stone-900 tracking-tighter drop-shadow-md">₹1000</div>
          <div className="text-stone-500 font-bold uppercase tracking-widest mt-2 text-sm bg-stone-100 px-3 py-1 rounded-full border border-stone-200">PER TEAM (2-4 MEMBERS)</div>
        </div>
      </div>
    </div>
  )
}

function VenueSection() {
  return (
    <div className="relative w-full bg-stone-900 text-white py-24 px-6 z-20 pointer-events-auto">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-700 bg-stone-800 text-yellow-400 text-sm font-bold mb-2">
            <MapPin className="w-4 h-4" /> THE HIVE LOCATION
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">NAGARJUNA COLLEGE OF <span className="text-yellow-400">ENGINEERING & TECHNOLOGY</span></h2>
          <p className="text-stone-400 font-medium text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
            Join us at our state-of-the-art campus. Equipped with high-speed Wi-Fi, spacious hacking zones, and all the amenities needed for a 24-hour sprint.
          </p>

          <div className="pt-4">
            <a href="https://www.google.com/maps/dir//Nagarjuna+College+Of+Engineering+%26+Technology,+Beedaganahalli,+Post,+Devanahalli,+Venkatagiri+Kote,+Bengaluru,+Karnataka+562135/@12.8656081,77.5963265,15z/data=!3m1!4b1!4m8!4m7!1m0!1m5!1m1!1s0x3bae16773c548eed:0xb9434aad7474e7df!2m2!1d77.7278326!2d13.3508814?entry=ttu&g_ep=EgoyMDI2MDQxMy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-stone-900 px-8 py-4 rounded-full font-black uppercase tracking-wider transition-all hover:scale-105 shadow-[0_0_20px_rgba(250,204,21,0.3)] w-full sm:w-auto">
              Get Directions <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        <div className="w-full lg:w-1/2 rounded-[2.5rem] overflow-hidden border-2 border-stone-800 shadow-2xl relative group h-[400px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3882.26059288863!2d77.72525767512111!3d13.334057887015525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16773c548eed%3A0xb9434aad7474e7df!2sNagarjuna%20College%20Of%20Engineering%20%26%20Technology!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            className="absolute inset-0 w-full h-full border-0 filter grayscale invert-[0.9] contrast-125 opacity-80 group-hover:filter-none group-hover:opacity-100 transition-all duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 border-[6px] border-stone-900/50 rounded-[2.5rem] pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
function FAQSection() {
  const faqs = [
    { q: "Who can participate?", a: "Any enrolled college student from any degree program. If you can code, design, or pitch, you belong in the hive." },
    { q: "Is there a registration fee?", a: "Yes, a flat team fee of ₹1000 covers up to 4 hackers. This provides snacks, unlimited caffeine, swags, and server costs." },
    { q: "Do I need a team?", a: "You can hack solo, but we recommend a team of 2-4 members. The team Captain pays the flat fee and invites members using a unique 6-digit code." },
    { q: "What if I don't know how to code?", a: "Hackathons need designers (UI/UX) and business minds (pitching, viability). Code is just one part of the product." },
    { q: "Can we build on past projects?", a: "No. All code must be written during the 24-hour window. Using pre-existing templates for UI is fine, but the core logic must be fresh." }
  ]
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="relative w-full max-w-4xl mx-auto px-6 py-24 z-20 pointer-events-auto">
      <div className="mb-12 text-center">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-stone-900 mb-4">INTEL <span className="text-yellow-400">& FAQS</span></h2>
        <p className="text-stone-600 font-bold text-lg">Everything you need to know before joining the swarm.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-md border-2 border-stone-100 rounded-2xl overflow-hidden transition-colors hover:border-yellow-400 shadow-sm">
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full px-6 py-6 text-left flex justify-between items-center">
              <span className="font-black text-stone-900 text-lg">{faq.q}</span>
              <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} className="text-yellow-500"><ChevronDown className="w-6 h-6" /></motion.div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 text-stone-500 font-medium">
                  {faq.a}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
// ==========================================
// 4. MASTER LAYOUT & CUSTOM AUTH ENGINE
// ==========================================
export default function Home() {
  const [isDesktop, setIsDesktop] = useState(true)
  const [activeModal, setActiveModal] = useState<'none' | 'auth'>('none')

  const [isLoginMode, setIsLoginMode] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => setIsDesktop(window.innerWidth > 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCustomAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)

    // 👇 YOUR MASTER KEY: Change this to your actual admin email 👇
    const ADMIN_EMAIL = "admin@hackbuzz.com"

    try {
      if (isLoginMode) {
        // ==========================================
        // LOGIN FLOW (Smart Routing)
        // ==========================================
        const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword)
        const user = userCredential.user

        setActiveModal('none')

        // 1. THE GOD ROUTE (Admin check)
        if (user.email === ADMIN_EMAIL) {
          router.push('/admin')
          setIsLoggingIn(false)
          return
        }

        // Fetch database profile for everyone else
        const userSnap = await getDoc(doc(db, "users", user.uid))

        if (userSnap.exists()) {
          const userData = userSnap.data()

          // 2. THE JUDGE ROUTE
          if (userData.role === 'judge') {
            router.push('/judges')
          }
          // 3. THE VETERAN HACKER ROUTE (Already in a team)
          else if (userData.teamCode) {
            router.push('/dashboard')
          }
          // 4. THE ROOKIE HACKER ROUTE (Needs to join/create a team)
          else {
            router.push('/register')
          }
        } else {
          // Fallback if DB record is missing
          router.push('/register')
        }

      } else {
        // ==========================================
        // SIGN UP FLOW
        // ==========================================
        if (!authName) {
          alert("Please enter your name.")
          setIsLoggingIn(false)
          return
        }

        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword)
        const user = userCredential.user

        // Save fresh user to database
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: authName,
          email: user.email,
          joinedAt: new Date().toISOString(),
          teamCode: null
        })

        setActiveModal('none')

        // If you are creating the Admin account for the very first time
        if (user.email === ADMIN_EMAIL) {
          router.push('/admin')
        } else {
          router.push('/register')
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already registered. Please switch to Login.")
      } else if (error.code === 'auth/invalid-credential') {
        alert("Invalid email or password.")
      } else {
        alert("Authentication failed: " + error.message)
      }
    }
    setIsLoggingIn(false)
  }

  const HeroContent = () => (
    <div className="relative w-full h-screen flex flex-col items-center justify-center px-6 text-center pointer-events-none mt-10">

      {/* THE RESTORED DATE BADGE */}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-stone-100 text-stone-600 text-sm font-bold mb-8 shadow-sm pointer-events-auto relative z-10">
        <Sparkles className="w-4 h-4 text-yellow-500" /> 7th May - 8th May 2026
      </motion.div>

      {/* HERO TITLE WITH MELTING 'BUZZ' */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative z-10 flex items-center justify-center gap-1 md:gap-4 drop-shadow-xl">
        <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter leading-[0.9] text-stone-900">
          HACK
        </h1>
        {/* The Melting BUZZ Block */}
        <div className="relative drop-shadow-[0_10px_10px_rgba(217,119,6,0.3)]">
          <div style={{ filter: 'url(#goo)' }} className="relative">
            <span className="relative inline-block text-white px-4 md:px-8 py-2 md:py-4 text-6xl md:text-[10rem] font-black tracking-tighter leading-[0.9] bg-gradient-to-b from-[#FDE047] via-[#F59E0B] to-[#D97706] rounded-[2rem] z-10 shadow-[inset_0_6px_12px_rgba(255,255,255,0.8),inset_0_-8px_20px_rgba(146,64,14,0.8)]">
              BUZZ
            </span>
            {/* Drips for BUZZ */}
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.1 }} className="absolute top-[80%] left-[20%] w-6 h-16 bg-gradient-to-b from-[#D97706] to-[#92400E] rounded-b-full z-0" />
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} className="absolute top-[80%] left-[50%] w-4 h-10 bg-gradient-to-b from-[#D97706] to-[#B45309] rounded-b-full z-0" />
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.8 }} className="absolute top-[80%] left-[80%] w-5 h-20 bg-gradient-to-b from-[#D97706] to-[#92400E] rounded-b-full z-0" />
          </div>
          {/* Glass Reflection */}
          <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[2rem] z-30 pointer-events-none" />
        </div>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 md:mt-16 text-lg md:text-2xl text-stone-600 font-bold max-w-2xl drop-shadow-md relative z-10">
        Build the hive. 24 hours of pure building, insane energy, and a ₹30,000 prize pool.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-12 w-full max-w-4xl flex flex-col md:flex-row gap-6 justify-center pointer-events-auto relative z-10">
        <div className="flex-1">
          <LiveCountdown />
        </div>
        <div className="md:w-64 bg-stone-900 rounded-3xl p-6 text-left shadow-[0_15px_30px_rgba(28,25,23,0.3)] flex flex-col justify-center border border-stone-800 relative overflow-hidden group mt-8 md:mt-0">
          <div className="absolute inset-0 bg-stone-800 opacity-0 group-hover:opacity-20 transition-opacity" />
          <div className="flex items-center gap-2 mb-2 text-yellow-400 relative z-10">
            <MapPin className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wider uppercase">The Venue</span>
          </div>
          <h3 className="font-black text-white text-xl leading-tight relative z-10">Nagarjuna College of Engineering and Technology.</h3>
          <p className="text-stone-400 text-xs mt-2 font-medium relative z-10">Bengaluru, Karnataka</p>
        </div>
      </motion.div>

      {/* THE MELTING 'ENTER THE HIVE' BUTTON */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto pointer-events-auto relative z-10">
        <div className="relative drop-shadow-[0_10px_10px_rgba(217,119,6,0.3)]">
          <div style={{ filter: 'url(#goo)' }} className="relative">
            <button onClick={() => { setIsLoginMode(false); setActiveModal('auth') }} className="relative px-12 py-6 bg-gradient-to-b from-[#FDE047] via-[#F59E0B] to-[#D97706] text-stone-900 text-2xl font-black rounded-full shadow-[inset_0_4px_8px_rgba(255,255,255,0.6),inset_0_-4px_12px_rgba(146,64,14,0.6)] flex items-center justify-center gap-3 z-10 hover:scale-105 transition-transform">
              Enter The Hive <ArrowRight className="w-6 h-6" />
            </button>
            {/* Button Drips */}
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.2 }} className="absolute top-[70%] left-[25%] w-4 h-10 bg-gradient-to-b from-[#D97706] to-[#92400E] rounded-b-full z-0" />
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 2.8, repeat: Infinity, delay: 0.7 }} className="absolute top-[70%] left-[75%] w-3 h-8 bg-gradient-to-b from-[#D97706] to-[#B45309] rounded-b-full z-0" />
          </div>
          <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-full z-30 pointer-events-none" />
        </div>
      </motion.div>
    </div>
  )

  return (
    <main className="relative w-full min-h-screen bg-[#FAFAFA] text-stone-900 overflow-x-hidden selection:bg-yellow-400 selection:text-black">

      {/* THE GOOEY SVG FILTER FOR THE HONEY PHYSICS */}
      <svg className="absolute w-0 h-0" style={{ visibility: 'hidden' }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <HoneycombCSS />

      <nav className="fixed top-0 w-full z-40 px-6 md:px-12 py-6 flex justify-between items-center pointer-events-none">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-yellow-400 p-2 rounded-xl rotate-12 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]"><Hexagon className="w-5 h-5 text-stone-900" fill="currentColor" /></div>
          <span className="font-black text-xl tracking-tight drop-shadow-sm">HACKBUZZ</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 pointer-events-auto items-center">
          <span className="hidden md:block text-xs font-bold text-stone-400 mr-4">Powered by <a href="https://www.veltrex.co.in" target="_blank" rel="noopener noreferrer" className="text-stone-900 hover:underline cursor-pointer">Veltrex.devs</a></span>
          <button onClick={() => { setIsLoginMode(true); setActiveModal('auth') }} className="px-6 py-2.5 bg-white border-2 border-stone-100 rounded-full text-sm font-bold hover:border-yellow-400 hover:shadow-[0_8px_30px_rgba(250,204,21,0.2)] transition-all">
            Login Space
          </button>
        </motion.div>
      </nav>

      {isDesktop ? (
        <div className="fixed inset-0 z-0 pointer-events-auto">
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <ambientLight intensity={2.5} color="#ffffff" />
            <directionalLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
            <directionalLight position={[-10, -10, -10]} intensity={1} color="#FACC15" />
            <Suspense fallback={null}><MinecraftSwarm /></Suspense>
            <Environment preset="city" />
          </Canvas>
        </div>
      ) : (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-amber-400/20 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10 w-full pointer-events-none flex flex-col">
        <section className="w-full min-h-screen shrink-0"><HeroContent /></section>
        <section className="w-full shrink-0 bg-white"><BentoGrid /></section>
        <section className="w-full shrink-0"><GuidelinesSection /></section>
        <section className="w-full shrink-0"><RegistrationFeeSection /></section>
        <section className="w-full shrink-0"><VenueSection /></section>
        <section className="w-full shrink-0 bg-stone-50/50"><ScheduleTimeline /></section>
        <section className="w-full shrink-0 bg-white"><JudgingCriteriaSection /></section>
        <section className="w-full shrink-0"><FAQSection /></section>
        <section className="w-full shrink-0"><ContactSection /></section>

        <footer className="w-full py-16 px-6 text-center pointer-events-auto bg-stone-900 text-stone-400 border-t-4 border-yellow-400">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="bg-stone-800 p-4 rounded-2xl rotate-12 mb-6"><Hexagon className="w-8 h-8 text-yellow-400" fill="currentColor" /></div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">HACKBUZZ 2026</h2>
            <p className="font-bold mb-12">Code. Create. Conquer.</p>

            <div className="w-full border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm font-medium">© 2026 Hackbuzz. All systems operational.</p>
              <div className="flex items-center gap-2 bg-stone-800 px-4 py-2 rounded-full">
                <Code2 className="w-4 h-4 text-stone-500" />
                <span className="text-sm font-bold">Engineered by <a href="https://www.veltrex.co.in" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline cursor-pointer">Veltrex.devs</a></span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {activeModal === 'auth' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm pointer-events-auto" onClick={() => setActiveModal('none')}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[2rem] p-8 md:p-12 max-w-md w-full shadow-2xl relative border border-stone-100">
              <button onClick={() => setActiveModal('none')} className="absolute top-6 right-6 p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors"><X className="w-5 h-5 text-stone-600" /></button>

              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-yellow-400 rounded-2xl rotate-12 flex items-center justify-center mb-6 shadow-sm">
                  <Hexagon className="w-8 h-8 text-stone-900 -rotate-12" fill="currentColor" />
                </div>
                <h2 className="text-3xl font-black text-stone-900 uppercase tracking-tight mb-2">
                  {isLoginMode ? 'Access Node' : 'Create Profile'}
                </h2>
                <p className="text-stone-500 font-medium text-sm">
                  {isLoginMode ? 'Authenticate to enter your workspace.' : 'Register your credentials to join the hive.'}
                </p>
              </div>

              <form onSubmit={handleCustomAuth} className="space-y-4" autoComplete="off">
                {/* 🛡️ ANTI-AUTOFILL BARRICADE (Tricks the browser into filling these invisible ones instead) 🛡️ */}
                <input type="email" name="fake_email" id="fake_email" style={{ display: 'none' }} aria-hidden="true" autoComplete="email" />
                <input type="password" name="fake_password" id="fake_password" style={{ display: 'none' }} aria-hidden="true" autoComplete="new-password" />

                {!isLoginMode && (
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"><UserCheck className="w-5 h-5" /></div>
                      <input type="text" required={!isLoginMode} value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="John Doe" className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-yellow-400 focus:bg-white transition-all font-bold text-stone-900" autoComplete="off" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"><Mail className="w-5 h-5" /></div>
                    <input type="email" name="hive_agent_email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="hacker@college.edu" className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-yellow-400 focus:bg-white transition-all font-bold text-stone-900" autoComplete="new-password" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"><Key className="w-5 h-5" /></div>
                    <input type="password" name="hive_agent_password" required minLength={6} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-yellow-400 focus:bg-white transition-all font-bold text-stone-900" autoComplete="new-password" />
                  </div>
                </div>

                <button type="submit" disabled={isLoggingIn} className="w-full mt-4 py-4 bg-stone-900 text-yellow-400 font-black text-lg rounded-xl hover:bg-stone-800 transition-colors uppercase tracking-widest disabled:opacity-50 flex justify-center items-center gap-2">
                  {isLoggingIn ? 'Processing...' : (isLoginMode ? 'Login' : 'Sign Up')} <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              <div className="mt-6 text-center">
                <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} className="text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors">
                  {isLoginMode ? "Don't have an account? Sign up" : "Already registered? Login here"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}