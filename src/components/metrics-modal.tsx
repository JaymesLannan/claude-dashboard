"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { Lock, ArrowRight, X } from "lucide-react";

export function MetricsNavLink() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="hover:text-white transition-colors duration-150 text-sm text-zinc-400">
          Metrics
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-zinc-900 p-8 shadow-2xl shadow-black/50 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors">
            <X className="h-4 w-4" />
          </Dialog.Close>

          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Lock className="h-5 w-5 text-violet-400" />
            </div>

            <div>
              <Dialog.Title className="text-lg font-semibold text-white">
                Personal Usage Metrics
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Sign in to view your personal usage metrics — token consumption, costs, and model breakdowns.
              </Dialog.Description>
            </div>

            <Link
              href="/login"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
