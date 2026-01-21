import React from 'react'
import { Routes, Route } from 'react-router'

import { UserDetails } from './pages/user-details'
import { HomePage } from './pages/home-page'
import { BoardDetails } from './pages/board-details'
import { Login } from './pages/login-page'
import { SignUp } from './pages/sign-up'
import { UserMsg } from './cmps/user-msg'
import { Kanban } from './pages/kanban'
import { Dashboard } from './pages/dashboard'
import { FounderApprovalsPage } from './pages/founder-approvals'
import { BoardAssignmentPage } from './pages/board-assignment'
import { BoardRedirect } from './pages/board-redirect'
import { ProtectedRoute } from './cmps/ProtectedRoute'
import { GuestRoute } from './cmps/GuestRoute'

export function RootCmp() {

    return <div>
        <main>
            <Routes>
                <Route element={<HomePage />} path="/" />
                <Route 
                    element={
                        <GuestRoute>
                            <Login />
                        </GuestRoute>
                    } 
                    path="/login" 
                />
                <Route 
                    element={
                        <GuestRoute>
                            <SignUp />
                        </GuestRoute>
                    } 
                    path="/signup" 
                />
                <Route 
                    element={
                        <ProtectedRoute>
                            <BoardRedirect />
                        </ProtectedRoute>
                    } 
                    path="/board" 
                />
                <Route 
                    element={
                        <ProtectedRoute>
                            <BoardDetails />
                        </ProtectedRoute>
                    } 
                    path="/board/:boardId" 
                />
                <Route 
                    element={
                        <ProtectedRoute>
                            <Kanban />
                        </ProtectedRoute>
                    } 
                    path="/:boardId/views/kanban" 
                />
                <Route 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                    path="/:boardId/views/dashboard" 
                />
                <Route 
                    element={
                        <ProtectedRoute>
                            <UserDetails />
                        </ProtectedRoute>
                    } 
                    path="/user-details/:userId" 
                />
                <Route 
                    element={
                        <ProtectedRoute>
                            <FounderApprovalsPage />
                        </ProtectedRoute>
                    } 
                    path="/founder/approvals" 
                />
                <Route 
                    element={
                        <ProtectedRoute>
                            <BoardAssignmentPage />
                        </ProtectedRoute>
                    } 
                    path="/founder/board-assignment" 
                />
            </Routes>
        </main>
        <UserMsg />
    </div>
}
