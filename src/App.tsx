import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { EngagementDashboard } from './components/EngagementDashboard';
import { WorkpaperView } from './components/WorkpaperView';
import { SplitScreenViewer } from './components/SplitScreenViewer';
import { TrialBalanceView } from './components/TrialBalanceView';
import { AdjustingEntriesView } from './components/AdjustingEntriesView';
import { ReviewNotesView } from './components/ReviewNotesView';
import { DocumentsVaultView } from './components/DocumentsVaultView';
import { LineageView } from './components/LineageView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AILineageModal } from './components/AILineageModal';
import { AuditLogModal } from './components/AuditLogModal';
import { BundleExportModal } from './components/BundleExportModal';

import {
  CURRENT_USERS,
  INITIAL_AUDIT_LOG,
  INITIAL_DOCUMENTS,
  INITIAL_ENGAGEMENT,
  INITIAL_REVIEW_NOTES,
  INITIAL_TICKMARKS,
  INITIAL_TRIAL_BALANCE,
  INITIAL_WORKPAPERS,
  MASTER_COA,
  INITIAL_AI_LINEAGE,
} from './data/initialData';
import { BUILT_IN_TEMPLATES } from './templates/catalog';
import {
  AdjustingEntry,
  AILineageRecord,
  AuditLogEntry,
  BoundingBox,
  ClientEngagement,
  Framework,
  ReviewNote,
  Tickmark,
  TickmarkType,
  TrialBalanceRow,
  UserProfile,
  WorkpaperInstance,
} from './types';

export const App: React.FC = () => {
  // Engagement State
  const [engagement, setEngagement] = useState<ClientEngagement>(INITIAL_ENGAGEMENT);
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USERS[0]);

  // Views & Navigation
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedWorkpaperId, setSelectedWorkpaperId] = useState<string>('wp_bank_rec');
  const [splitScreen, setSplitScreen] = useState<boolean>(false);

  // Core Audit Data
  const [trialBalance, setTrialBalance] = useState<TrialBalanceRow[]>(INITIAL_TRIAL_BALANCE);
  const [workpapers, setWorkpapers] = useState<WorkpaperInstance[]>(INITIAL_WORKPAPERS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [activeDocumentId, setActiveDocumentId] = useState<string>(INITIAL_DOCUMENTS[0].id);
  const [tickmarks, setTickmarks] = useState<Tickmark[]>(INITIAL_TICKMARKS);
  const [selectedTickmark, setSelectedTickmark] = useState<Tickmark | null>(INITIAL_TICKMARKS[0]);
  const [reviewNotes, setReviewNotes] = useState<ReviewNote[]>(INITIAL_REVIEW_NOTES);
  const [lineageRecords, setLineageRecords] = useState<AILineageRecord[]>(INITIAL_AI_LINEAGE);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOG);
  const [adjustingEntries, setAdjustingEntries] = useState<AdjustingEntry[]>([
    {
      id: 'aje_01',
      reference: 'AJE-1',
      date: '2027-01-20',
      description: 'Reclassify short-term portion of security deposit to prepayments',
      status: 'Approved',
      preparedBy: 'Sarah Chen, CPA',
      lines: [
        { id: 'l1', accountCode: '1300', description: 'Prepaid Expenses', debit: 15000, credit: 0 },
        { id: 'l2', accountCode: '1240', description: 'Long-term Deposits', debit: 0, credit: 15000 },
      ],
    },
  ]);

  // Modals
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalTab, setAiModalTab] = useState<'chat' | 'review'>('chat');
  const [auditLogModalOpen, setAuditLogModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [lineageModalOpen, setLineageModalOpen] = useState(false);
  const [inspectedLineageRecord, setInspectedLineageRecord] = useState<AILineageRecord | null>(null);

  // Helper to append to immutable audit log (Section 7)
  const addAuditLog = (
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    entityName: string,
    action: AuditLogEntry['action'],
    newValue?: string,
    reason?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      entityType,
      entityId,
      entityName,
      action,
      newValue,
      reason,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Workpaper Payload Updates
  const handleUpdateWorkpaperPayload = (workpaperId: string, newPayload: Record<string, any>) => {
    setWorkpapers((prev) =>
      prev.map((wp) => {
        if (wp.id === workpaperId) {
          return {
            ...wp,
            dataPayload: newPayload,
            lastUpdated: new Date().toISOString(),
          };
        }
        return wp;
      })
    );
    addAuditLog(
      'workpaper',
      workpaperId,
      workpapers.find((w) => w.id === workpaperId)?.title || 'Workpaper',
      'UPDATE',
      'Edited payload cells & reactive formulas'
    );
  };

  // Workpaper Procedures Updates
  const handleUpdateProcedures = (workpaperId: string, updatedProcedures: any[]) => {
    setWorkpapers((prev) =>
      prev.map((wp) => {
        if (wp.id === workpaperId) {
          return {
            ...wp,
            procedureStatuses: updatedProcedures,
            lastUpdated: new Date().toISOString(),
          };
        }
        return wp;
      })
    );
    addAuditLog(
      'workpaper',
      workpaperId,
      workpapers.find((w) => w.id === workpaperId)?.title || 'Workpaper',
      'UPDATE',
      'Updated procedure checklist & conclusions'
    );
  };

  // Signoff Flow (Preparer -> Reviewer -> Partner)
  const handleSignoff = (
    workpaperId: string,
    role: 'preparer' | 'reviewer' | 'partner',
    comment?: string
  ) => {
    setWorkpapers((prev) =>
      prev.map((wp) => {
        if (wp.id === workpaperId) {
          const newSignoffs = [
            ...wp.signoffs.filter((s) => s.role !== role),
            {
              role,
              signedBy: currentUser.id,
              userName: currentUser.name,
              signedAt: new Date().toISOString(),
              comments: comment,
            },
          ];

          let newStatus = wp.status;
          let isLocked = wp.isLocked;

          if (role === 'preparer') newStatus = 'Prepared';
          if (role === 'reviewer') newStatus = 'Reviewed';
          if (role === 'partner') {
            newStatus = 'Partner Approved';
            isLocked = true; // Section 1 & 7 lock rule
          }

          return {
            ...wp,
            status: newStatus as any,
            signoffs: newSignoffs,
            isLocked,
            lastUpdated: new Date().toISOString(),
          };
        }
        return wp;
      })
    );

    addAuditLog(
      'signoff',
      workpaperId,
      workpapers.find((w) => w.id === workpaperId)?.title || 'Workpaper',
      'SIGN_OFF',
      `${role.toUpperCase()} sign-off executed by ${currentUser.name}`,
      comment
    );
  };

  // 1-Click Interactive Tickmark Placement
  const handlePlaceTickmark = (
    docId: string,
    markType: TickmarkType,
    symbol: string,
    box: BoundingBox
  ) => {
    const doc = documents.find((d) => d.id === docId) || documents[0];
    const targetWp = workpapers.find((w) => w.id === selectedWorkpaperId) || workpapers[0];

    const newTickmark: Tickmark = {
      id: `tmk_${Date.now()}`,
      workpaperId: targetWp.id,
      targetField: 'bank_balance',
      documentId: doc.id,
      documentTitle: doc.fileName,
      pageNo: box.page || 1,
      boundingBox: box,
      markType,
      markSymbol: symbol,
      markColor: markType.includes('bank') ? '#10b981' : markType.includes('invoiced') ? '#6366f1' : '#f59e0b',
      placedBy: currentUser.id,
      placedAt: new Date().toISOString(),
      explanation: `Verified and tied directly to ${doc.fileName} page ${box.page || 1}.`,
    };

    setTickmarks((prev) => [newTickmark, ...prev]);
    setSelectedTickmark(newTickmark);

    addAuditLog(
      'workpaper',
      targetWp.id,
      targetWp.title,
      'TICKMARK_ADD',
      `Placed tickmark ${symbol} linked to ${doc.fileName}`,
      'Evidence voucher cross-reference'
    );
  };

  // Review Notes Handling
  const handleAddReviewNote = (workpaperId: string, ref: string, text: string) => {
    const newNote: ReviewNote = {
      id: `rn_${Date.now()}`,
      workpaperId,
      workpaperRef: ref,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      text,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    setReviewNotes((prev) => [newNote, ...prev]);
    addAuditLog('workpaper', workpaperId, `WP ${ref}`, 'CREATE', `Raised review note: "${text.slice(0, 40)}..."`);
  };

  const handleClearReviewNote = (noteId: string, explanation: string) => {
    setReviewNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            status: 'Cleared',
            clearedBy: currentUser.name,
            clearedAt: new Date().toISOString(),
            clearedExplanation: explanation,
          };
        }
        return n;
      })
    );
    addAuditLog('workpaper', noteId, 'Review Note', 'UPDATE', `Cleared review note: "${explanation.slice(0, 40)}..."`);
  };

  // COA Auto-Mapping Handling
  const handleConfirmMapping = (accountCode: string, masterCode: string) => {
    setTrialBalance((prev) =>
      prev.map((row) => {
        if (row.accountCode === accountCode) {
          return {
            ...row,
            masterCode,
            mappingStatus: 'confirmed',
          };
        }
        return row;
      })
    );
    addAuditLog(
      'mapping',
      accountCode,
      `Account ${accountCode}`,
      'AI_ACCEPT',
      `Mapped account ${accountCode} -> Master COA ${masterCode}`
    );
  };

  const handleAcceptAllAISuggestions = () => {
    setTrialBalance((prev) =>
      prev.map((row) => {
        if (row.mappingStatus !== 'confirmed' && row.aiSuggestedCode) {
          return {
            ...row,
            masterCode: row.aiSuggestedCode,
            mappingStatus: 'confirmed',
          };
        }
        return row;
      })
    );
    addAuditLog(
      'mapping',
      'batch_coa',
      'Trial Balance COA Mapping',
      'AI_ACCEPT',
      'Confirmed all AI suggested Chart of Accounts mappings with high confidence'
    );
  };

  // Roll-Forward simulation (Section 4: One click copies last year's file)
  const handleRollForward = () => {
    addAuditLog(
      'workpaper',
      'roll_forward_py',
      'Engagement Roll-Forward',
      'CREATE',
      'Rolled forward FY2025 structures and opening balances into FY2026 engagement file'
    );
    alert('Roll-Forward Completed: Copied file index structure, brought forward prior-year figures, and reset procedures for FY2026.');
  };

  // Framework Change
  const handleFrameworkChange = (fw: Framework) => {
    const days = fw === 'US_GAAS' ? 14 : 60;
    setEngagement((prev) => ({
      ...prev,
      framework: fw,
      assemblyDeadlineDays: days,
    }));
    addAuditLog('workpaper', 'engagement', 'Framework Configuration', 'UPDATE', `Changed target framework to ${fw} (${days}-day assembly window)`);
  };

  const currentWorkpaper = workpapers.find((w) => w.id === selectedWorkpaperId) || workpapers[0];
  const currentTemplate = BUILT_IN_TEMPLATES[currentWorkpaper.template_id] || BUILT_IN_TEMPLATES['bank_rec'];

  return (
    <div className="app-container">
      {/* Global Application Header */}
      <Header
        engagement={engagement}
        currentUser={currentUser}
        allUsers={CURRENT_USERS}
        onSelectUser={setCurrentUser}
        onFrameworkChange={handleFrameworkChange}
        splitScreen={splitScreen}
        onToggleSplitScreen={() => setSplitScreen(!splitScreen)}
        onOpenAIModal={(tab) => {
          setAiModalTab(tab);
          setAiModalOpen(true);
        }}
        onOpenAuditLog={() => setAuditLogModalOpen(true)}
        onOpenExportModal={() => setExportModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="main-layout">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          selectedWorkpaperId={selectedWorkpaperId}
          onSelectView={(view, wpId) => {
            setCurrentView(view);
            if (wpId) setSelectedWorkpaperId(wpId);
          }}
          workpapers={workpapers}
          trialBalance={trialBalance}
          reviewNotes={reviewNotes}
        />

        {/* Center Content Workspace */}
        <main className="content-pane">
          {currentView === 'dashboard' && (
            <EngagementDashboard
              engagement={engagement}
              workpapers={workpapers}
              trialBalance={trialBalance}
              reviewNotes={reviewNotes}
              onOpenWorkpaper={(wpId) => {
                setSelectedWorkpaperId(wpId);
                setCurrentView('workpaper');
              }}
              onNavigateToTB={() => setCurrentView('trial_balance')}
              onRollForward={handleRollForward}
            />
          )}

          {currentView === 'workpaper' && (
            <WorkpaperView
              workpaper={currentWorkpaper}
              template={currentTemplate}
              trialBalance={trialBalance}
              currentUser={currentUser}
              tickmarks={tickmarks}
              onUpdatePayload={handleUpdateWorkpaperPayload}
              onUpdateProcedures={handleUpdateProcedures}
              onSignoff={handleSignoff}
              onSelectTickmark={(tm) => {
                setSelectedTickmark(tm);
                setActiveDocumentId(tm.documentId);
                setSplitScreen(true);
              }}
              onAddReviewNote={handleAddReviewNote}
              onOpenSplitScreen={() => setSplitScreen(true)}
              onInspectLineage={(fieldId) => {
                const found = lineageRecords.find((l) => l.targetField === fieldId) || lineageRecords[0];
                setInspectedLineageRecord(found);
                setLineageModalOpen(true);
              }}
            />
          )}

          {currentView === 'trial_balance' && (
            <TrialBalanceView
              trialBalance={trialBalance}
              masterCOA={MASTER_COA}
              onConfirmMapping={handleConfirmMapping}
              onAcceptAllAISuggestions={handleAcceptAllAISuggestions}
              onResetTB={() => setTrialBalance(INITIAL_TRIAL_BALANCE)}
            />
          )}

          {currentView === 'aje' && (
            <AdjustingEntriesView
              entries={adjustingEntries}
              masterCOA={MASTER_COA}
              currentUser={currentUser}
              onCreateEntry={(newEntry) => {
                setAdjustingEntries((prev) => [newEntry, ...prev]);
                addAuditLog('aje', newEntry.id, newEntry.reference, 'CREATE', `Created proposed adjusting entry: ${newEntry.description}`);
              }}
              onApproveEntry={(id) => {
                setAdjustingEntries((prev) =>
                  prev.map((e) => (e.id === id ? { ...e, status: 'Approved' } : e))
                );
                addAuditLog('aje', id, 'Adjusting Entry', 'UPDATE', 'Approved adjusting journal entry');
              }}
            />
          )}

          {currentView === 'review_notes' && (
            <ReviewNotesView
              notes={reviewNotes}
              workpapers={workpapers}
              currentUser={currentUser}
              onClearNote={handleClearReviewNote}
              onAddNote={handleAddReviewNote}
              onOpenWorkpaper={(wpId) => {
                setSelectedWorkpaperId(wpId);
                setCurrentView('workpaper');
              }}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsVaultView
              documents={documents}
              onOpenSplitViewer={(docId) => {
                setActiveDocumentId(docId);
                setSplitScreen(true);
              }}
            />
          )}

          {currentView === 'lineage' && (
            <LineageView
              engagement={engagement}
              lineageRecords={lineageRecords}
              onInspectRecord={(rec) => {
                setInspectedLineageRecord(rec);
                setLineageModalOpen(true);
              }}
            />
          )}
        </main>

        {/* Split-Screen Evidence Document Viewer */}
        {splitScreen && (
          <SplitScreenViewer
            documents={documents}
            activeDocumentId={activeDocumentId}
            onSelectDocument={setActiveDocumentId}
            selectedTickmark={selectedTickmark}
            onPlaceTickmark={handlePlaceTickmark}
            onClose={() => setSplitScreen(false)}
          />
        )}
      </div>

      {/* Global Overlays & Modals */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        initialTab={aiModalTab}
        onClose={() => setAiModalOpen(false)}
        workpapers={workpapers}
        trialBalance={trialBalance}
        onOpenWorkpaper={(wpId) => {
          setSelectedWorkpaperId(wpId);
          setCurrentView('workpaper');
        }}
      />

      <AILineageModal
        isOpen={lineageModalOpen}
        onClose={() => setLineageModalOpen(false)}
        record={inspectedLineageRecord}
      />

      <AuditLogModal
        isOpen={auditLogModalOpen}
        onClose={() => setAuditLogModalOpen(false)}
        logs={auditLogs}
      />

      <BundleExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        engagement={engagement}
        workpapers={workpapers}
      />
    </div>
  );
};
export default App;
