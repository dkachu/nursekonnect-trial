"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Updated import

interface Props {
  children: React.ReactNode;
  triggerText?: string; // Made this dynamic for reuse
}

const Modal = ({ children, triggerText = "Click to add a review" }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="max-sm:text-[12px] max-sm:px-4 my-6 bg-blue-600 hover:bg-blue-700">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          {/* Using a visually hidden title for accessibility if not needed */}
          <DialogTitle className="text-center font-bold text-xl">
            {triggerText}
          </DialogTitle>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
