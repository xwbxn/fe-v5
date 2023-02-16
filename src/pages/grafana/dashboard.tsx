import React, { useEffect, useState, useRef } from 'react'
import { useEffectOnce } from 'react-use';
import { getDashboard, updateDashboard } from '@/services/grafanaDashboard';
import { useParams } from 'react-router-dom';

interface URLParam {
    id: string;
}


export default function Dashboard() {
    const [dashboard, setDashboard] = useState<any>({})
    const dashboardRef = useRef()
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
            if (dashboard.name) {
                updateDashboard(id, {
                    name: dashboard.name,
                    ident: dashboard.ident,
                    tags: dashboard.tags,
                    grafana_id: e.data.dashboard.id,
                    grafana_url: e.data.dashboard.url
                }).then(() => {
                    refresh()
                })
            }
        }
    }

    useEffectOnce(() => {
        window.addEventListener('message', handleCallback, false)
    })

    if (dashboard.grafana_id && dashboard.grafana_id !== 0) {
        return (
            <iframe src={`http://localhost:3000${dashboard.grafana_url}?bid=888`} style={{ width: "100%", height: "100%" }}></iframe>
        )
    } else {
        //new
        return (
            <iframe src={`http://localhost:3000/dashboard/new?bid=${id}`} style={{ width: "100%", height: "100%" }}></iframe>
        )
    }
}