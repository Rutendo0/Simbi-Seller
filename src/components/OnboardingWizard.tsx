"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function OnboardingWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  function next() {
    setStep((s) => Math.min(3, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function submit() {
    // Basic validation
    if (!businessName || !email || !bankName || !accountNumber) {
      toast({ title: "Missing information", description: "Please fill the required fields." });
      return;
    }

    const onboarding = { businessName, email, registrationNumber, address, bankName, accountName, accountNumber };
    localStorage.setItem("simbi_onboarding", JSON.stringify(onboarding));

    toast({ title: "Onboarding saved", description: "Your store information has been saved (mock)." });
    onOpenChange(false);
    setStep(0);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seller Onboarding</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 0 && (
            <div>
              <label className="text-sm font-medium">Business Name</label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              <label className="text-sm font-medium mt-2">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}

          {step === 1 && (
            <div>
              <label className="text-sm font-medium">Registration Number</label>
              <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
              <label className="text-sm font-medium mt-2">Business Address</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="text-sm font-medium">Bank Name</label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
              <label className="text-sm font-medium mt-2">Account Name</label>
              <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              <label className="text-sm font-medium mt-2">Account Number</label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="font-medium">Review</p>
              <pre className="text-xs bg-muted p-2 rounded mt-2">{JSON.stringify({ businessName, email, registrationNumber, address, bankName, accountName, accountNumber }, null, 2)}</pre>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {step > 0 && (
              <Button variant="outline" onClick={back} className="mr-2">
                Back
              </Button>
            )}
          </div>

          <div>
            {step < 3 && (
              <Button onClick={next} className="mr-2">
                Next
              </Button>
            )}
            {step === 3 && (
              <Button onClick={submit}>Finish</Button>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="ml-2">
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
