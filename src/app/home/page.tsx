"use client";

import { ChooseRepositoryForm } from "@/components/custom/ChooseRepositoryForm";
import { HomeSidebar } from "@/components/custom/HomeSidebar";
import { RepositoryDataTable } from "@/components/custom/RepositoryData";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function HomePage() {
  return (
    <>
      <SidebarProvider>
        <HomeSidebar />
        <main className="flex-1 p-4 bg-background text-foreground font-mono">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Welcome to GitCodeBot</h1>
            <p className="mb-6">Your AI assistant for GitHub repositories.</p>
            <ChooseRepositoryForm />
            <div className="flex flex-col gap-1 pb-4 pt-4 mt-8 border-t border-b">
              <h3 className="text-lg font-semibold">Available Repositories</h3>
              <p className="text-muted-foreground">
                List of repositories available to you.
              </p>
              <RepositoryDataTable />
            </div>
          </div>
        </main>
      </SidebarProvider>
    </>
  );
}
