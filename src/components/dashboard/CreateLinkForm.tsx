"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link2, Sparkles, Lock, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isValidUrl } from "@/lib/utils";
import { createShortLink, isAliasAvailable } from "@/lib/firebase-utils";
import { canCreateSecretLinks, canUseCustomAliases } from "@/types";
import toast from "react-hot-toast";

interface CreateLinkFormProps {
  userId: string;
  userXP: number;
  onLinkCreated: () => void;
}

export function CreateLinkForm({
  userId,
  userXP,
  onLinkCreated,
}: CreateLinkFormProps) {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [password, setPassword] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canUseAlias = canUseCustomAliases(userXP);
  const canUsePassword = canCreateSecretLinks(userXP);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url) {
      setError("Please enter a URL");
      return;
    }

    // Add protocol if missing
    let finalUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      finalUrl = "https://" + url;
    }

    if (!isValidUrl(finalUrl)) {
      setError("Please enter a valid URL");
      return;
    }

    // Validate custom alias
    if (customAlias) {
      if (!canUseAlias) {
        toast.error("Custom aliases unlock at Level 20 (500 XP)!");
        return;
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(customAlias)) {
        setError(
          "Alias can only contain letters, numbers, hyphens, and underscores",
        );
        return;
      }
      if (customAlias.length < 3 || customAlias.length > 20) {
        setError("Alias must be 3-20 characters");
        return;
      }
      const available = await isAliasAvailable(customAlias);
      if (!available) {
        setError("This alias is already taken");
        return;
      }
    }

    if (password && !canUsePassword) {
      toast.error("Password protection unlocks at Level 10 (200 XP)!");
      return;
    }

    setIsLoading(true);

    try {
      // ✅ FIX: Use 'null' instead of 'undefined' to prevent Firestore crashes
      await createShortLink(finalUrl, userId, {
        customAlias: customAlias || undefined,
        password: password || undefined,
      });

      toast.success("Link created successfully!");
      setUrl("");
      setCustomAlias("");
      setPassword("");
      setShowAdvanced(false);
      onLinkCreated();
    } catch (err) {
      console.error("Error creating link:", err);
      toast.error("Failed to create link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="p-6 col-span-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white">Create New Link</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter your long URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              icon={<Link2 className="w-4 h-4" />}
              error={error}
            />
          </div>
          <Button type="submit" isLoading={isLoading}>
            Shorten
          </Button>
        </div>

        <motion.button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 mt-4 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <Wand2 className="w-4 h-4" />
          {showAdvanced ? "Hide" : "Show"} Advanced Options
        </motion.button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Custom Alias{" "}
                  {!canUseAlias && (
                    <span className="text-neon-purple">
                      (Unlocks at 500 XP)
                    </span>
                  )}
                </label>
                <Input
                  type="text"
                  placeholder="my-custom-link"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  disabled={!canUseAlias}
                  className={
                    !canUseAlias ? "opacity-50 cursor-not-allowed" : ""
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Password Protection{" "}
                  {!canUsePassword && (
                    <span className="text-neon-purple">
                      (Unlocks at 200 XP)
                    </span>
                  )}
                </label>
                <Input
                  type="password"
                  placeholder="Optional password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!canUsePassword}
                  icon={<Lock className="w-4 h-4" />}
                  className={
                    !canUsePassword ? "opacity-50 cursor-not-allowed" : ""
                  }
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </GlassCard>
  );
}
