"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

/* ─── Updated packages (aligned with homepage) ─── */
const packagesData: Record<
    string,
    { name: string; priceBase: number; label: string; features: string[] }
> = {
    "deep-interior": {
        name: "Industrial Deep Interior",
        priceBase: 3499,
        label: "Lavado a base de inyección y extracción",
        features: [
            "Lavado a base de inyección y extracción",
            "Vapor seco industrial a 180°C",
            "Aspirado de alta potencia",
            "Hidratación de pieles Connolly",
            "Sanitización con ozono",
        ],
    },
    "signature-detail": {
        name: "Signature Detail",
        priceBase: 9500,
        label: "Incluye Industrial Deep Interior completo",
        features: [
            "Industrial Deep Interior completo",
            "Corrección de pintura en 2 etapas",
            "Sellador cerámico express (6 meses)",
            "Sanitización con ozono",
            "Técnicos certificados IDA",
        ],
    },
    "ceramic-coating": {
        name: "Ceramic Coating",
        priceBase: 14999,
        label: "Protección cerámica profesional",
        features: [
            "Todo lo del Signature Detail",
            "Recubrimiento cerámico profesional",
            "Corrección de pintura en 3 etapas",
            "Certificado Doctor Foam",
            "Seguimiento post-servicio 30 días",
        ],
    },
    "graphene-upgrade": {
        name: "Ceramic + Graphene Shield",
        priceBase: 17999,
        label: "Protección de grafeno 5-7 años",
        features: [
            "Todo lo del Signature Detail",
            "Recubrimiento de grafeno (5-7 años)",
            "PPF en zonas de alto impacto",
            "Certificado Doctor Foam",
            "Seguimiento personalizado 30 días",
        ],
    },
    "foam-maintenance": {
        name: "Foam Maintenance",
        priceBase: 1800,
        label: "Mantenimiento post-servicio",
        features: [
            "Foam cannon industrial de alta presión",
            "Descontaminación química completa",
            "Barra de arcilla profesional",
            "Sellador UV de larga duración",
            "Limpieza de vidrios y rines",
        ],
    },
};

const vehicleSizes = [
    { value: "sedan-2filas", label: "Sedán / SUV 2 filas", coefficient: 1.0 },
    { value: "pickup-3filas", label: "Pick Up / SUV 3 filas", coefficient: 1.15 },
];

const premiumZones = [
    "Bosque Real", "Polanco", "Zona Esmeralda / Atizapán", "Santa Fe / Lomas de Santa Fe",
    "Lomas de Chapultepec", "Pedregal / San Ángel", "Interlomas / Tecamachalco",
    "Metepec / Toluca", "Bosques de las Lomas", "Otra zona (consultar cobertura)",
];

/* ─── Calendar Component ─── */
function Calendar({
    selectedDate,
    onSelectDate,
}: {
    selectedDate: string;
    onSelectDate: (date: string) => void;
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [occupiedDates, setOccupiedDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAvailability = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/bookings/availability?month=${currentMonth + 1}&year=${currentYear}`
            );
            const data = await res.json();
            setOccupiedDates(data.occupied || []);
        } catch {
            console.error("Error fetching availability");
        }
        setLoading(false);
    }, [currentMonth, currentYear]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const canGoPrev = currentYear > today.getFullYear() || (currentYear === today.getFullYear() && currentMonth > today.getMonth());

    const goToPrev = () => {
        if (!canGoPrev) return;
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNext = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(currentYear, currentMonth, d);
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const isPast = date < today;
        const isSunday = date.getDay() === 0;
        const isOccupied = occupiedDates.includes(dateStr);
        const isSelected = dateStr === selectedDate;
        const isDisabled = isPast || isSunday || isOccupied;
        const isToday = date.getTime() === today.getTime();

        days.push(
            <button
                key={d}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onSelectDate(dateStr)}
                style={{
                    width: "100%",
                    aspectRatio: "1",
                    border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    background: isSelected
                        ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                        : isOccupied
                            ? "rgba(239, 68, 68, 0.08)"
                            : isPast || isSunday
                                ? "#f1f5f9"
                                : "#ffffff",
                    color: isSelected ? "#ffffff" : isDisabled ? "#94a3b8" : isOccupied ? "#ef4444" : "#0f172a",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    fontWeight: isSelected || isToday ? 700 : 500,
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    position: "relative" as const,
                }}
            >
                {d}
                {isToday && !isSelected && (
                    <span style={{ position: "absolute", bottom: "3px", width: "4px", height: "4px", borderRadius: "50%", background: "#2563eb" }} />
                )}
            </button>
        );
    }

    return (
        <div>
            {/* Month Navigation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <button
                    type="button"
                    onClick={goToPrev}
                    disabled={!canGoPrev}
                    style={{
                        background: "none", border: "none", color: canGoPrev ? "#0f172a" : "#cbd5e1",
                        cursor: canGoPrev ? "pointer" : "not-allowed", fontSize: "1.2rem", padding: "0.5rem",
                    }}
                >
                    ←
                </button>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#0f172a", fontSize: "1.05rem" }}>
                    {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                    type="button" onClick={goToNext}
                    style={{ background: "none", border: "none", color: "#0f172a", cursor: "pointer", fontSize: "1.2rem", padding: "0.5rem" }}
                >
                    →
                </button>
            </div>

            {/* Day names */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem", marginBottom: "0.5rem" }}>
                {dayNames.map((day) => (
                    <div key={day} style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", padding: "0.25rem" }}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.3rem",
                opacity: loading ? 0.5 : 1, transition: "opacity 0.3s",
            }}>
                {days}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", fontSize: "0.75rem", color: "#64748b", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "linear-gradient(135deg, #2563eb, #3b82f6)" }} />
                    Seleccionado
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239,68,68,0.3)" }} />
                    Ocupado
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#ffffff", border: "1px solid #e2e8f0" }} />
                    Disponible
                </span>
            </div>
        </div>
    );
}

/* ─── Main Booking Form ─── */
function BookingForm() {
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);
    const [selectedPackage, setSelectedPackage] = useState(searchParams.get("paquete") || "signature-detail");
    const [vehicleSize, setVehicleSize] = useState("sedan-2filas");
    const [serviceDate, setServiceDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const cancelled = searchParams.get("cancelled");
    const [hoveredPkg, setHoveredPkg] = useState<string | null>(null);

    /* Form fields */
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [address, setAddress] = useState("");
    const [addressColonia, setAddressColonia] = useState("");
    const [vehicleBrand, setVehicleBrand] = useState("");
    const [vehicleModel, setVehicleModel] = useState("");
    const [vehicleYear, setVehicleYear] = useState("");
    const [vehicleColor, setVehicleColor] = useState("");
    const [needsFactura, setNeedsFactura] = useState(false);
    const [rfc, setRfc] = useState("");
    const [razonSocial, setRazonSocial] = useState("");

    const pkg = packagesData[selectedPackage];
    const coeff = vehicleSizes.find((v) => v.value === vehicleSize)?.coefficient || 1.0;
    const currentPrice = pkg ? Math.round(pkg.priceBase * coeff) : 0;

    useEffect(() => {
        const paquete = searchParams.get("paquete");
        if (paquete && packagesData[paquete]) setSelectedPackage(paquete);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId: selectedPackage,
                    vehicleSize,
                    serviceDate,
                    customerName,
                    customerEmail,
                    customerPhone,
                    address: `${address}, ${addressColonia}`,
                    vehicleBrand, vehicleModel, vehicleYear, vehicleColor,
                    rfc: needsFactura ? rfc : "",
                    razonSocial: needsFactura ? razonSocial : "",
                    needsFactura,
                }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                setError(data.error || "Error al procesar el pago");
                setLoading(false);
            }
        } catch {
            setError("Error de conexión. Inténtalo de nuevo.");
            setLoading(false);
        }
    };

    /* Step indicator */
    const steps = [
        { num: 1, label: "Servicio" },
        { num: 2, label: "Fecha" },
        { num: 3, label: "Datos" },
        { num: 4, label: "Pagar" },
    ];

    return (
        <form onSubmit={handleSubmit}>
            {/* Step Indicator */}
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "2rem" }}>
                {steps.map((s) => (
                    <button
                        key={s.num}
                        type="button"
                        onClick={() => s.num < step && setStep(s.num)}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.4rem",
                            background: step === s.num ? "rgba(37, 99, 235, 0.1)" : step > s.num ? "rgba(16, 185, 129, 0.08)" : "#f1f5f9",
                            border: step === s.num ? "1.5px solid #2563eb" : step > s.num ? "1.5px solid #10b981" : "1.5px solid #e2e8f0",
                            borderRadius: "2rem", padding: "0.5rem 1rem",
                            color: step === s.num ? "#2563eb" : step > s.num ? "#10b981" : "#94a3b8",
                            fontSize: "0.8rem", fontWeight: 600, cursor: s.num < step ? "pointer" : "default",
                            fontFamily: "var(--font-heading)",
                            transition: "all 0.3s ease",
                        }}
                    >
                        {step > s.num ? "✓" : s.num}
                        <span style={{ display: "inline" }}>{s.label}</span>
                    </button>
                ))}
            </div>

            {cancelled && (
                <div style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "0.75rem", padding: "1rem 1.5rem", marginBottom: "2rem", color: "#dc2626", fontSize: "0.9rem" }}>
                    El pago fue cancelado. Puedes intentar de nuevo.
                </div>
            )}
            {error && (
                <div style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "0.75rem", padding: "1rem 1.5rem", marginBottom: "2rem", color: "#dc2626", fontSize: "0.9rem" }}>
                    {error}
                </div>
            )}

            {/* ─── STEP 1: Package + Vehicle Size ─── */}
            {step === 1 && (
                <div className="glass-card" style={{ padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.2rem", marginBottom: "1.25rem", color: "#0f172a" }}>1. Selecciona tu servicio</h2>

                    <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
                        {Object.entries(packagesData).map(([key, p]) => {
                            const isSelected = selectedPackage === key;
                            const isHovered = hoveredPkg === key;
                            return (
                                <button
                                    key={key} type="button"
                                    onClick={() => setSelectedPackage(key)}
                                    onMouseEnter={() => setHoveredPkg(key)}
                                    onMouseLeave={() => setHoveredPkg(null)}
                                    style={{
                                        padding: "1.25rem 1.5rem", borderRadius: "0.75rem",
                                        border: isSelected ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                                        background: isSelected
                                            ? "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(59,130,246,0.04))"
                                            : isHovered
                                                ? "#f8fafc"
                                                : "#ffffff",
                                        cursor: "pointer", textAlign: "left", color: "#0f172a",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        transform: isSelected ? "scale(1.01)" : isHovered ? "translateY(-2px)" : "none",
                                        boxShadow: isSelected
                                            ? "0 4px 20px rgba(37,99,235,0.12)"
                                            : isHovered
                                                ? "0 4px 12px rgba(0,0,0,0.06)"
                                                : "0 1px 3px rgba(0,0,0,0.04)",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        {/* Selection indicator */}
                                        <div style={{
                                            width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                                            border: isSelected ? "none" : "2px solid #cbd5e1",
                                            background: isSelected ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "transparent",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            transition: "all 0.3s ease",
                                        }}>
                                            {isSelected && (
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                    <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", color: isSelected ? "#1e40af" : "#0f172a" }}>{p.name}</div>
                                            <div style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.15rem" }}>{p.label}</div>
                                        </div>
                                    </div>
                                    <div className="gradient-text" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.2rem", whiteSpace: "nowrap" }}>
                                        ${p.priceBase.toLocaleString("es-MX")}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", color: "#334155" }}>Tamaño del vehículo</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                        {vehicleSizes.map((v) => (
                            <button
                                key={v.value} type="button" onClick={() => setVehicleSize(v.value)}
                                style={{
                                    padding: "1rem", borderRadius: "0.75rem",
                                    border: vehicleSize === v.value ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                                    background: vehicleSize === v.value ? "rgba(37, 99, 235, 0.06)" : "#ffffff",
                                    cursor: "pointer", color: "#0f172a", textAlign: "center",
                                    transition: "all 0.3s ease",
                                    boxShadow: vehicleSize === v.value ? "0 2px 12px rgba(37,99,235,0.1)" : "none",
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: vehicleSize === v.value ? "#1e40af" : "#0f172a" }}>{v.label}</div>
                                <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                                    {v.coefficient === 1.0 ? "Precio base" : `+${Math.round((v.coefficient - 1) * 100)}% sobre precio base`}
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        type="button" onClick={() => setStep(2)}
                        className="btn-premium" style={{ width: "100%", justifyContent: "center" }}
                    >
                        Continuar → Elegir fecha
                    </button>
                </div>
            )}

            {/* ─── STEP 2: Calendar ─── */}
            {step === 2 && (
                <div className="glass-card" style={{ padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "#0f172a" }}>2. Elige la fecha de tu servicio</h2>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                        Atendemos de lunes a sábado. Los días en rojo ya están reservados.
                    </p>
                    <Calendar selectedDate={serviceDate} onSelectDate={setServiceDate} />

                    {serviceDate && (
                        <div style={{ marginTop: "1.25rem", padding: "1rem", background: "rgba(37, 99, 235, 0.06)", borderRadius: "0.75rem", border: "1px solid rgba(37, 99, 235, 0.15)", textAlign: "center" }}>
                            <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Fecha seleccionada: </span>
                            <span style={{ color: "#0f172a", fontWeight: 700 }}>
                                {new Date(serviceDate + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </span>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                        <button type="button" onClick={() => setStep(1)} className="btn-outline" style={{ flex: 1 }}>
                            ← Atrás
                        </button>
                        <button
                            type="button" onClick={() => serviceDate && setStep(3)}
                            className="btn-premium" disabled={!serviceDate}
                            style={{ flex: 2, justifyContent: "center", opacity: serviceDate ? 1 : 0.5 }}
                        >
                            Continuar → Tus datos
                        </button>
                    </div>
                </div>
            )}

            {/* ─── STEP 3: Contact + Vehicle Details ─── */}
            {step === 3 && (
                <div>
                    <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "1.25rem", color: "#0f172a" }}>3. Tus datos de contacto</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={labelStyle}>Nombre completo *</label>
                                <input type="text" placeholder="Tu nombre" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Email *</label>
                                <input type="email" placeholder="tu@email.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} style={inputStyle} required />
                            </div>
                            <div>
                                <label style={labelStyle}>WhatsApp *</label>
                                <input type="tel" placeholder="55 1234 5678" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={inputStyle} required />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "1.25rem", color: "#0f172a" }}>Datos del vehículo</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div><label style={labelStyle}>Marca *</label><input type="text" placeholder="BMW, Mercedes..." value={vehicleBrand} onChange={(e) => setVehicleBrand(e.target.value)} style={inputStyle} required /></div>
                            <div><label style={labelStyle}>Modelo *</label><input type="text" placeholder="X5, Clase C..." value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} style={inputStyle} required /></div>
                            <div><label style={labelStyle}>Año *</label><input type="number" placeholder="2024" value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} style={inputStyle} required min="2000" max="2027" /></div>
                            <div><label style={labelStyle}>Color *</label><input type="text" placeholder="Negro, Blanco..." value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} style={inputStyle} required /></div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "1.25rem", color: "#0f172a" }}>Dirección del servicio</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={labelStyle}>Calle y número *</label>
                                <input type="text" placeholder="Av. Masaryk 123" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} required />
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={labelStyle}>Colonia / Zona *</label>
                                <select value={addressColonia} onChange={(e) => setAddressColonia(e.target.value)} style={inputStyle} required>
                                    <option value="">Selecciona zona</option>
                                    {premiumZones.map((z) => (<option key={z} value={z}>{z}</option>))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "#0f172a" }}>Facturación</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                            <input type="checkbox" id="needsFactura" checked={needsFactura} onChange={(e) => setNeedsFactura(e.target.checked)} style={{ width: "1.25rem", height: "1.25rem", accentColor: "#2563eb" }} />
                            <label htmlFor="needsFactura" style={{ color: "#334155", fontSize: "0.95rem", cursor: "pointer" }}>Requiero factura (CFDI)</label>
                        </div>
                        {needsFactura && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div><label style={labelStyle}>RFC *</label><input type="text" placeholder="XAXX010101000" value={rfc} onChange={(e) => setRfc(e.target.value.toUpperCase())} style={inputStyle} required={needsFactura} maxLength={13} /></div>
                                <div><label style={labelStyle}>Razón Social *</label><input type="text" placeholder="Nombre o Razón Social" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} style={inputStyle} required={needsFactura} /></div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button type="button" onClick={() => setStep(2)} className="btn-outline" style={{ flex: 1 }}>← Atrás</button>
                        <button
                            type="button"
                            onClick={() => customerName && customerEmail && customerPhone && vehicleBrand && vehicleModel && address && addressColonia && setStep(4)}
                            className="btn-premium" style={{ flex: 2, justifyContent: "center" }}
                        >
                            Continuar → Resumen
                        </button>
                    </div>
                </div>
            )}

            {/* ─── STEP 4: Summary + Pay ─── */}
            {step === 4 && pkg && (
                <div className="glass-card" style={{ padding: "2rem", borderColor: "rgba(37, 99, 235, 0.15)" }}>
                    <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "#0f172a" }}>Resumen de tu reserva</h2>

                    <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
                        {[
                            { label: "Servicio", value: pkg.name },
                            { label: "Vehículo", value: `${vehicleBrand} ${vehicleModel} ${vehicleYear} (${vehicleColor})` },
                            { label: "Tamaño", value: vehicleSizes.find((v) => v.value === vehicleSize)?.label || "" },
                            { label: "Fecha", value: serviceDate ? new Date(serviceDate + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "" },
                            { label: "Dirección", value: `${address}, ${addressColonia}` },
                            { label: "Contacto", value: `${customerName} · ${customerPhone}` },
                        ].map((item) => (
                            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{item.label}</span>
                                <span style={{ color: "#0f172a", fontSize: "0.9rem", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", background: "rgba(37, 99, 235, 0.06)", borderRadius: "0.75rem", marginBottom: "1.5rem", border: "1px solid rgba(37,99,235,0.1)" }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#0f172a", fontSize: "1.1rem" }}>Total (IVA incluido)</span>
                        <span className="gradient-text" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem" }}>
                            ${currentPrice.toLocaleString("es-MX")} MXN
                        </span>
                    </div>

                    <ul style={{ listStyle: "none", margin: "0 0 1.5rem", padding: 0, color: "#475569", fontSize: "0.85rem" }}>
                        {pkg.features.map((f, i) => (
                            <li key={i} style={{ paddingBlock: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ color: "#10b981" }}>✓</span> {f}
                            </li>
                        ))}
                    </ul>

                    <button type="submit" className="btn-premium" disabled={loading} style={{ width: "100%", justifyContent: "center", fontSize: "1.1rem", padding: "1.1rem 2rem", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                        {loading ? "Procesando..." : `🔒 Pagar $${currentPrice.toLocaleString("es-MX")} MXN`}
                    </button>

                    <p style={{ color: "#94a3b8", fontSize: "0.8rem", textAlign: "center", marginTop: "1rem" }}>
                        Pago seguro procesado por Stripe. Una vez confirmado, tu servicio queda agendado para la fecha seleccionada.
                    </p>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button type="button" onClick={() => setStep(3)} className="btn-outline" style={{ flex: 1 }}>← Modificar datos</button>
                    </div>
                </div>
            )}

            {/* Chat */}
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "0.75rem" }}>¿Tienes dudas?</p>
                <a href="/mi-cuenta/chat" className="btn-outline" style={{ display: "inline-flex" }}>
                    💬 Escríbenos por chat
                </a>
            </div>
        </form>
    );
}

/* ─── Styles ─── */
const labelStyle: React.CSSProperties = {
    display: "block", fontFamily: "var(--font-heading)", fontSize: "0.85rem",
    fontWeight: 600, color: "#334155", marginBottom: "0.4rem",
};

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem",
    border: "1.5px solid #e2e8f0", background: "#ffffff",
    color: "#0f172a", fontSize: "0.95rem", fontFamily: "var(--font-body)", outline: "none",
    transition: "border-color 0.2s ease",
};

/* ─── Main Page ─── */
export default function ReservarPage() {
    return (
        <>
            <nav className="navbar navbar-scrolled">
                <div className="navbar-inner">
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.3rem" }}>
                            <span style={{ color: "#0f172a" }}>DOCTOR</span>{" "}
                            <span className="gradient-text">FOAM</span>
                        </span>
                    </Link>
                    <Link href="/" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.9rem", fontFamily: "var(--font-heading)" }}>
                        ← Inicio
                    </Link>
                </div>
            </nav>

            <main style={{ paddingTop: "6rem" }}>
                <section className="section-padding">
                    <div className="container" style={{ maxWidth: "900px" }}>
                        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                            <span className="section-label">Reservar y Pagar</span>
                            <h1 className="section-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}>
                                Agenda tu servicio de{" "}
                                <span className="gradient-text">detallado premium</span>
                            </h1>
                            <p className="section-subtitle" style={{ maxWidth: "600px" }}>
                                Selecciona tu paquete, elige una fecha disponible y paga en línea de forma segura.
                            </p>
                        </div>

                        <Suspense fallback={<div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Cargando...</div>}>
                            <BookingForm />
                        </Suspense>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-bottom" style={{ borderTop: "none", marginTop: 0 }}>
                    <p>&copy; {new Date().getFullYear()} Doctor Foam México. Todos los derechos reservados.</p>
                </div>
            </footer>
        </>
    );
}
