'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hexagon, QrCode, CheckCircle2, XCircle, UserCheck, ShieldAlert, ArrowRight, RefreshCw, Camera } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { db } from '../../lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

export default function CheckInScanner() {
    const [scanResult, setScanResult] = useState<any>(null)
    const [scanError, setScanError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [checkInStatus, setCheckInStatus] = useState<'idle' | 'success' | 'already_checked_in'>('idle')
    const scannerRef = useRef<Html5Qrcode | null>(null)

    useEffect(() => {
        // Initialize the raw camera engine
        scannerRef.current = new Html5Qrcode("reader")

        const startScanner = async () => {
            try {
                await scannerRef.current?.start(
                    { facingMode: "environment" }, // Forces the back camera
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        // ON SUCCESS
                        try {
                            const payload = JSON.parse(decodeURIComponent(decodedText))
                            if (payload.code && payload.team && payload.track) {
                                // Stop scanning immediately to prevent spam reading
                                if (scannerRef.current?.isScanning) {
                                    scannerRef.current.stop()
                                }
                                setScanResult(payload)
                                verifyAndCheckIn(payload.code)
                            } else {
                                setScanError("Invalid format. Not a Hive Code.")
                            }
                        } catch (err) {
                            setScanError("Unrecognized QR Code.")
                        }
                    },
                    (error) => {
                        // ON FAIL (Ignores empty frames)
                    }
                )
            } catch (err) {
                console.error("Camera Start Error:", err)
                setScanError("Camera blocked. Ensure you are using HTTPS or Localhost.")
            }
        }

        startScanner()

        // Cleanup function to turn off camera when leaving page
        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(console.error)
            }
        }
    }, [])

    const verifyAndCheckIn = async (teamCode: string) => {
        setIsProcessing(true)
        setScanError(null)

        try {
            const teamRef = doc(db, "teams", teamCode)
            const teamSnap = await getDoc(teamRef)

            if (!teamSnap.exists()) {
                setScanError("Team not found in database!")
                setCheckInStatus('idle')
                setIsProcessing(false)
                return
            }

            const teamData = teamSnap.data()

            if (teamData.checkedIn) {
                setCheckInStatus('already_checked_in')
            } else {
                await updateDoc(teamRef, { checkedIn: true, checkedInAt: new Date().toISOString() })
                setCheckInStatus('success')
            }

        } catch (error) {
            console.error(error)
            setScanError("Database connection failed.")
        }
        setIsProcessing(false)
    }

    const resetScanner = () => {
        setScanResult(null)
        setScanError(null)
        setCheckInStatus('idle')
        window.location.reload() // Safest way to completely re-mount the camera
    }

    return (
        <main className="min-h-screen bg-stone-900 text-stone-100 flex flex-col">

            {/* HEADER */}
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center justify-between shadow-md z-10 relative">
                <div className="flex items-center gap-2">
                    <Hexagon className="w-6 h-6 text-yellow-500" fill="currentColor" />
                    <span className="font-black tracking-tight text-lg uppercase text-white">Access Terminal</span>
                </div>
                <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">Admin</span>
                </div>
            </div>

            {/* SCANNER VIEWPORT */}
            <div className="flex-1 flex flex-col relative bg-black">

                {/* The raw camera feed mounts here. No ugly UI buttons. */}
                <div id="reader" className="w-full h-[50vh] overflow-hidden"></div>

                {/* OVERLAY & RESULTS */}
                <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-stone-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-stone-700 p-6 flex flex-col z-20">

                    <AnimatePresence mode="wait">
                        {!scanResult && !scanError ? (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center">
                                <Camera className="w-16 h-16 text-stone-600 mb-4 animate-pulse" />
                                <h2 className="text-xl font-black text-stone-300 uppercase tracking-widest mb-2">Awaiting Target</h2>
                                <p className="text-sm font-medium text-stone-500">Position the hacker's Dashboard QR code inside the camera frame.</p>
                            </motion.div>
                        ) : scanError ? (
                            <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center">
                                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                                <h2 className="text-xl font-black text-red-500 uppercase tracking-widest mb-2">Scan Failed</h2>
                                <p className="text-sm font-medium text-stone-400 mb-6 px-4">{scanError}</p>
                                <button onClick={resetScanner} className="px-8 py-4 bg-stone-800 text-white font-bold rounded-xl flex items-center gap-2 uppercase tracking-wider active:scale-95 transition-transform">
                                    <RefreshCw className="w-5 h-5" /> Retry Scan
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">

                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Scanned Team</span>
                                            <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none mt-1">{scanResult.team}</h2>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block">Access Code</span>
                                            <span className="font-mono font-bold text-xl text-stone-300">{scanResult.code}</span>
                                        </div>
                                    </div>

                                    <div className="inline-block px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg">
                                        <span className="text-xs font-bold text-stone-300 uppercase tracking-wide">Track: {scanResult.track}</span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    {isProcessing ? (
                                        <div className="w-full py-5 bg-stone-800 rounded-2xl flex justify-center items-center">
                                            <div className="w-6 h-6 border-4 border-stone-600 border-t-yellow-500 rounded-full animate-spin" />
                                        </div>
                                    ) : checkInStatus === 'success' ? (
                                        <div className="w-full py-4 bg-green-500 text-stone-900 rounded-2xl flex flex-col items-center justify-center">
                                            <CheckCircle2 className="w-8 h-8 mb-1" />
                                            <span className="font-black uppercase tracking-widest">Access Granted</span>
                                        </div>
                                    ) : checkInStatus === 'already_checked_in' ? (
                                        <div className="w-full py-4 bg-orange-500 text-stone-900 rounded-2xl flex flex-col items-center justify-center">
                                            <UserCheck className="w-8 h-8 mb-1" />
                                            <span className="font-black uppercase tracking-widest">Already Checked In</span>
                                        </div>
                                    ) : null}

                                    <button onClick={resetScanner} className="w-full mt-3 py-4 bg-stone-800 text-stone-300 font-bold rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider hover:bg-stone-700 active:scale-95 transition-all">
                                        Scan Next Team <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>

        </main>
    )
}