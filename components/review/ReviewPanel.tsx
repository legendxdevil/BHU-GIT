"use client";

import React, { useState } from "react";
import { ParcelConflict } from "@/types/conflict";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { CheckCircle2, XCircle, Edit3, Compass, AlertTriangle } from "lucide-react";
import { DecisionAction, DECISION_ACTIONS } from "@/lib/constants";

interface ReviewPanelProps {
  conflict: ParcelConflict;
  onDecision: (action: DecisionAction, reason: string, modifiedDetails?: any) => void;
  isSubmitting?: boolean;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  conflict,
  onDecision,
  isSubmitting = false,
}) => {
  const [activeAction, setActiveAction] = useState<DecisionAction | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleOpenModal = (action: DecisionAction) => {
    setActiveAction(action);
    setReason("");
    setError("");
  };

  const handleConfirmSubmit = () => {
    if (!reason.trim()) {
      setError("An explicit justification note is required for all audit decisions.");
      return;
    }
    if (activeAction) {
      onDecision(activeAction, reason);
      setActiveAction(null);
    }
  };

  return (
    <Card variant="default" padding="md" className="space-y-4">
      <div className="flex items-center justify-between border-b border-mist pb-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-ink">Reviewer Decision Workspace</h3>
          <p className="text-xs text-slate mt-0.5">
            Select an authoritative decision action to create a versioned land record update.
          </p>
        </div>
      </div>

      {/* Decision Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="accent"
          size="md"
          leftIcon={<CheckCircle2 className="w-4 h-4 text-sienna" />}
          onClick={() => handleOpenModal(DECISION_ACTIONS.APPROVE)}
          className="w-full justify-start"
        >
          Approve Harmonization
        </Button>

        <Button
          variant="outline"
          size="md"
          leftIcon={<Edit3 className="w-4 h-4 text-slate" />}
          onClick={() => handleOpenModal(DECISION_ACTIONS.MODIFY)}
          className="w-full justify-start"
        >
          Modify Proposal
        </Button>

        <Button
          variant="secondary"
          size="md"
          leftIcon={<Compass className="w-4 h-4 text-amber-600" />}
          onClick={() => handleOpenModal(DECISION_ACTIONS.FIELD_CHECK)}
          className="w-full justify-start"
        >
          Request Field Check
        </Button>

        <Button
          variant="danger"
          size="md"
          leftIcon={<XCircle className="w-4 h-4 text-white" />}
          onClick={() => handleOpenModal(DECISION_ACTIONS.REJECT)}
          className="w-full justify-start"
        >
          Reject Incoming Record
        </Button>
      </div>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={!!activeAction}
        onClose={() => setActiveAction(null)}
        title={
          activeAction === "approve"
            ? "Confirm Harmonization Approval"
            : activeAction === "reject"
            ? "Confirm Proposal Rejection"
            : activeAction === "modify"
            ? "Modify & Approve Proposal"
            : "Request Ground-Truth Field Verification"
        }
        description={`Target Parcel: ${conflict.parcelNumber} (${conflict.ward})`}
        footer={
          <>
            <Button variant="outline" onClick={() => setActiveAction(null)}>
              Cancel
            </Button>
            <Button
              variant={activeAction === "reject" ? "danger" : "accent"}
              onClick={handleConfirmSubmit}
              isLoading={isSubmitting}
            >
              Confirm & Commit Audit Event
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-fog rounded-2xl text-xs space-y-1 border border-mist">
            <div className="flex justify-between text-slate">
              <span>Current Version:</span>
              <span className="font-semibold text-ink">V2</span>
            </div>
            <div className="flex justify-between text-slate">
              <span>Next Committed Version:</span>
              <span className="font-semibold text-sienna font-serif font-bold">
                {activeAction === "approve" || activeAction === "modify" ? "V3 (New Approved Version)" : "V2 (Preserved Unchanged)"}
              </span>
            </div>
          </div>

          <Input
            label="Reviewer Justification Note (Required)"
            placeholder="e.g. Boundary confirmed via GNSS ground control points & aerial imagery."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            error={error}
          />
        </div>
      </Modal>
    </Card>
  );
};
