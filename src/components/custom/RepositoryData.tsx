"use client";

import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { RedirectType, redirect } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/dataTable";
import { MessageCircle } from "lucide-react";
import { Repository } from "@/types/repository";
import { Skeleton } from "../ui/skeleton";
import { getRepoNameFromUrl } from "@/utils/repository";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export const RepositoryColumns: ColumnDef<Repository>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => {
      const url = row.getValue("url") as string;
      return <span>{getRepoNameFromUrl(url)}</span>;
    },
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      const url = row.getValue("url") as string;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {url}
        </a>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusBadge = (status: string) => {
        switch (status) {
          case "ingested":
            return (
              <Badge
                variant="default"
                className="flex items-center gap-1 bg-green-800 text-white"
              >
                <CheckCircle className="h-4 w-4" />
                Ready
              </Badge>
            );
          case "ingesting":
            return (
              <Badge
                variant="default"
                className="flex items-center gap-1 bg-yellow-800 text-white"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Ingesting
              </Badge>
            );
          case "error":
            return (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Error
              </Badge>
            );
          default:
            return <Badge>{status}</Badge>;
        }
      };

      return getStatusBadge(status);
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const repo = row.original;
      const router = useRouter();
      const { user } = useUser();
      const handleStartChat = async () => {
        const sessionId = crypto.randomUUID();
        const chatUrl = `/chat/${sessionId}?repoUrl=${encodeURIComponent(
          repo.url
        )}`;

        try {
          const response = await fetch(`/api/chat/${sessionId}/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user?.id,
              sessionId: sessionId,
              title: "Detroit Chat with " + getRepoNameFromUrl(repo.url),
              metadata: {
                repoUrl: repo.url,
              },
            }),
          });
          if (!response.ok) {
            throw new Error("Failed to create chat session with error: " + response.statusText);
          }
          router.push(chatUrl);
        } catch (error) {
          console.error("Failed to create chat session:", error);
        }
      };

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleStartChat}
              variant="ghost"
              className="flex items-center gap-1 px-0 py-0 text-sm hover:bg-muted hover:text-primary"
              disabled={repo.status !== "ingested"}
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Start a chat session with this repo</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
];

export function RepositoryDataTable() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepositories() {
      try {
        if (!isLoaded || !isSignedIn || !user) {
          console.warn("User not loaded or not signed in");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/repos/by-user/${user?.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch repositories");
        }
        const data = await response.json();
        setRepositories(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    fetchRepositories();
  }, [isLoaded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full mt-10">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[60px]" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4 items-center">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className="py-4">
        <DataTable columns={RepositoryColumns} data={repositories} />
      </div>
    );
  }
}
