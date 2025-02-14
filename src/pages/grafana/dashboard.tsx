import React, { useEffect, useState, useRef } from 'react'
import { useEffectOnce } from 'react-use';
import { getDashboard, updateDashboard } from '@/services/grafanaDashboard';
import { useParams } from 'react-router-dom';

interface URLParam {
    id: string;
}


export default function Dashboard() {
    const [dashboard, setDashboard] = useState<any>({})
    const dashboardRef = useRef<any>()
    const { id } = useParams<URLParam>()

    const refresh = () => {
        getDashboard(id).then(res => {
            setDashboard(res)
            dashboardRef.current = res
            document.title = res.name
        })
    }

    useEffect(() => {
        refresh()
    }, [id])

    const handleCallback = (e) => {
        if (e.data.source === 'grafana') {
            if (dashboardRef.current !== undefined) {
                updateDashboard(id, {
                    name: dashboardRef.current.name,
                    ident: dashboardRef.current.ident,
                    tags: dashboardRef.current.tags,
                    grafana_id: e.data.dashboard.id,
                    grafana_url: e.data.dashboard.url
                }).then(() => {
                    refresh()
                    console.log(`dashboard ${id} updated`)
                })
            }
        }
    }

    useEffectOnce(() => {
        window.addEventListener('message', handleCallback, false)
        return () => {
            window.removeEventListener('message', handleCallback, false)
        }
    })

    if (dashboard.grafana_url !== "") {
        return (
            <iframe src={`${dashboard.grafana_url}`} style={{ width: "100%", height: "100%" }}></iframe>
        )
    } else {
        //new
        return (
            <iframe src={`/grafana/dashboard/new`} style={{ width: "100%", height: "100%" }}></iframe>
        )
    }
}