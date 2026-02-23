"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ReservarMiCuenta() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/reservar");
                return;
            }

            // Fetch customer profile to pre-fill booking form
            const { data: profile } = await supabase
                .from("customer_profiles")
                .select("full_name, phone, address, vehicle_type")
                .eq("user_id", user.id)
                .single();

            const params = new URLSearchParams();
            if (profile?.full_name) params.set("nombre", profile.full_name);
            if (user.email) params.set("email", user.email);
            if (profile?.phone) params.set("telefono", profile.phone);
            if (profile?.address) params.set("direccion", profile.address);
            if (profile?.vehicle_type) params.set("vehiculo", profile.vehicle_type);

            const qs = params.toString();
            router.push(`/reservar${qs ? `?${qs}` : ""}`);
        })();
    }, [router]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
            {loading && (
                <div style={{ textAlign: "center", color: "#94a3b8" }}>
                    <div className="spinner" style={{ margin: "0 auto 1rem" }} />
                    <p>Cargando tu perfil para reservar...</p>
                </div>
            )}
        </div>
    );
}
