import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import { format } from "date-fns";
import { useProjectData } from "@/components/project/useProjectData";
import { useProjects } from "@/hooks/useProjects";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { EditProfileDialog } from "@/components/auth/EditProfileDialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Profile {
  id: string;
  bride_name?: string;
  groom_name?: string;
}

const SidebarContent = () => {
  const { data: projects = [] } = useProjects();
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const session = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['profile', session.user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, queryClient]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/");
    }
  };
  
  useEffect(() => {
    if (projects.length > 0 && currentProjectId === null) {
      setCurrentProjectId(projects[0].id);
    }
  }, [projects, currentProjectId]);

  const { currentProject, isLoading } = useProjectData(currentProjectId);
  const { updateProjectDetails } = useProjectDetails(currentProjectId);

  if (isLoading || !currentProject || isProfileLoading) {
    return null;
  }

  return (
    <>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Wedding Planning Of
        </h2>
        {currentProject.wedding_date && (
          <p className="text-sm text-gray-500">
            {format(new Date(currentProject.wedding_date), "MMMM d, yyyy")}
          </p>
        )}
        {profile && (
          <p className="text-sm text-gray-600 mt-1">
            {profile.bride_name || "Bride"} & {profile.groom_name || "Groom"}
          </p>
        )}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-wedding-purple hover:text-wedding-purple/80 justify-start"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-wedding-purple hover:text-wedding-purple/80 justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link to="/">Overview</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link to="/guests">Guest List</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link to="/vendors">Venues & Vendors</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link to="/budget">Budget</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link to="/sitting-plan">Sitting Plans</Link>
          </Button>
        </div>
      </nav>

      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
      />
    </>
  );
};

export const AppSidebar = () => {
  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Hidden on mobile, always visible on desktop */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200">
        <SidebarContent />
      </aside>
    </>
  );
};