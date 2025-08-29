"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2Icon } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const repositoryFormSchema = z.object({
  repositoryUrl: z
    .string()
    .url({
      message: "Invalid URL format",
    })
    .regex(/^(https?:\/\/)?(www\.)?github\.com\/[^/]+\/[^/]+$/, {
      message: "Repository URL must be a valid GitHub repository URL",
    }),
});

export function ChooseRepositoryForm() {
  const { user } = useUser();
  const [repositoryFormButtonLoading, setRepositoryFormButtonLoading] =
    useState(false);
  const form = useForm<z.infer<typeof repositoryFormSchema>>({
    resolver: zodResolver(repositoryFormSchema),
    defaultValues: {
      repositoryUrl: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof repositoryFormSchema>) => {
    try {
      setRepositoryFormButtonLoading(true);
      const url = encodeURIComponent(data.repositoryUrl.trim());

      const res = await fetch(`/api/repos/by-url?url=${url}`);
      const repoExists = res.status === 200;
      const repo = repoExists ? await res.json() : null;

      if (!repoExists) {
        const createRes = await fetch("/api/repos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: data.repositoryUrl,
            users: [user?.id],
          }),
        });

        if (!createRes.ok) throw new Error("Failed to create repository");
        toast.success("Repository URL added successfully");
      } else {
        const users = repo.users || [];
        if (!users.includes(user?.id)) {
          const updateRes = await fetch(`/api/repos/by-url?url=${url}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              users: [...users, user?.id],
            }),
          });

          if (!updateRes.ok) throw new Error("Failed to update repository");
          toast.success("Repository URL updated successfully");
        } else {
          toast.info("Repository already available");
        }
      }
    } catch (error) {
      console.error("Error submitting repository URL:", error);
      toast.error("Failed to add repository URL");
    } finally {
      setRepositoryFormButtonLoading(false);
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="font-mono space-y-8"
      >
        <Toaster richColors />
        <FormField
          control={form.control}
          name="repositoryUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repository URL</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl className="flex-1">
                  <Input
                    placeholder="https://github.com/owner/repository-name"
                    {...field}
                  />
                </FormControl>
                {repositoryFormButtonLoading ? (
                  <Button disabled>
                    <Loader2Icon className="animate-spin" />
                    Submit
                  </Button>
                ) : (
                  <Button type="submit">Submit</Button>
                )}
              </div>

              <FormDescription>
                Enter the full URL of the GitHub repository you want to talk to.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
