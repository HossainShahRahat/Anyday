import React from 'react'
import { NavBar } from '../cmps/nav-bar'
import FounderApprovalPanel from '../cmps/FounderApprovalPanel'

export function FounderApprovalsPage() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <NavBar />
            <div className="founder-approvals-page" style={{ 
                flex: 1, 
                marginLeft: '65px',
                padding: '20px',
                backgroundColor: '#f5f6fa'
            }}>
                <FounderApprovalPanel />
            </div>
        </div>
    )
}