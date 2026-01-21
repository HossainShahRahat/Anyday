import React from 'react'
import { NavBar } from '../cmps/nav-bar'
import FounderApprovalPanel from '../cmps/FounderApprovalPanel'

export function FounderApprovalsPage() {
    return (
        <div>
            <NavBar />
            <div className="founder-approvals-page">
                <FounderApprovalPanel />
            </div>
        </div>
    )
}