// src/services/admin.service.js (Updated version)
import { supabase } from "@/lib/supabase";

class AdminService {
  // Get all admins (superadmin only)
  async getAllAdmins() {
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select(
          "id, firstname, lastname, email, role, is_active, last_login, created_at",
        )
        .in("role", ["superadmin", "admin"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching admins:", error);
        return { error: "Failed to fetch admins" };
      }

      // Transform to match the component's expected format
      const transformedUsers = users.map((user) => ({
        id: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        role: user.role === "superadmin" ? "super_admin" : "admin",
        status: user.is_active ? "active" : "restricted",
        lastActive: user.last_login || user.created_at,
        createdAt: user.created_at.split("T")[0],
      }));

      return { admins: transformedUsers };
    } catch (error) {
      console.error("Get all admins error:", error);
      return { error: "An error occurred while fetching admins" };
    }
  }

  // Add new admin (superadmin only) - Now uses fixed password "password"
  async addAdmin(adminData, currentUserId) {
    try {
      const { firstName, lastName, email } = adminData;

      // Fixed password "password"
      const defaultPassword = "password";

      // Check if user already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("email")
        .eq("email", email.toLowerCase());

      if (existingUsers && existingUsers.length > 0) {
        return { error: "User with this email already exists" };
      }

      // Create user with default password
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            firstname: firstName,
            lastname: lastName,
            email: email.toLowerCase(),
            password_hash: defaultPassword, // Will be hashed by trigger
            role: "admin",
            is_active: true,
          },
        ])
        .select("id, firstname, lastname, email, role, is_active, created_at")
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return { error: "Failed to create admin user" };
      }

      // Log activity
      await this.logActivity(currentUserId, "ADMIN_CREATED", {
        email,
        firstName,
        lastName,
      });

      return {
        success: true,
        user: {
          id: newUser.id,
          firstName: newUser.firstname,
          lastName: newUser.lastname,
          email: newUser.email,
          role: newUser.role === "superadmin" ? "super_admin" : "admin",
          status: newUser.is_active ? "active" : "restricted",
          createdAt: newUser.created_at.split("T")[0],
        },
        password: defaultPassword, // Return password to show in modal
      };
    } catch (error) {
      console.error("Add admin error:", error);
      return { error: error.message || "An error occurred while adding admin" };
    }
  }

  // Get current user session
  async getCurrentUser() {
    try {
      const sessionToken = localStorage.getItem("sessionToken");
      if (!sessionToken) return null;

      const { data: sessions, error: sessionError } = await supabase
        .from("user_sessions")
        .select("user_id, expires_at")
        .eq("token", sessionToken);

      if (sessionError || !sessions || sessions.length === 0) return null;

      const session = sessions[0];

      if (new Date(session.expires_at) < new Date()) {
        await supabase.from("user_sessions").delete().eq("token", sessionToken);
        localStorage.removeItem("sessionToken");
        return null;
      }

      const { data: users, error: userError } = await supabase
        .from("users")
        .select(
          "id, firstname, lastname, email, role, is_active, last_login, created_at",
        )
        .eq("id", session.user_id);

      if (userError || !users || users.length === 0) {
        localStorage.removeItem("sessionToken");
        return null;
      }

      const user = users[0];
      if (!user.is_active) {
        localStorage.removeItem("sessionToken");
        return null;
      }

      return user;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  // Restrict user (superadmin only) - No email
  async restrictUser(userId, currentUserId) {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .update({ is_active: false })
        .eq("id", userId)
        .select("id, firstname, lastname, email, is_active")
        .single();

      if (error) {
        return { error: "Failed to restrict user" };
      }

      // Log activity
      await this.logActivity(currentUserId, "USER_RESTRICTED", {
        targetUserId: userId,
        targetEmail: user.email,
      });

      return { success: true, user };
    } catch (error) {
      console.error("Restrict user error:", error);
      return { error: "An error occurred while restricting user" };
    }
  }

  // Unrestrict user (superadmin only) - No email
  async unrestrictUser(userId, currentUserId) {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .update({ is_active: true })
        .eq("id", userId)
        .select("id, firstname, lastname, email, is_active")
        .single();

      if (error) {
        return { error: "Failed to unrestrict user" };
      }

      // Log activity
      await this.logActivity(currentUserId, "USER_UNRESTRICTED", {
        targetUserId: userId,
        targetEmail: user.email,
      });

      return { success: true, user };
    } catch (error) {
      console.error("Unrestrict user error:", error);
      return { error: "An error occurred while unrestricting user" };
    }
  }

  // Promote user to superadmin (superadmin only) - No email
  async promoteToSuperAdmin(userId, currentUserId) {
    try {
      // Check if user exists and get info
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("role, firstname, lastname, email")
        .eq("id", userId);

      if (checkError || !existingUsers || existingUsers.length === 0) {
        return { error: "User not found" };
      }

      const existingUser = existingUsers[0];

      if (existingUser.role === "superadmin") {
        return { error: "User is already a Super Admin" };
      }

      const { data: user, error } = await supabase
        .from("users")
        .update({ role: "superadmin" })
        .eq("id", userId)
        .select("id, firstname, lastname, email, role")
        .single();

      if (error) {
        return { error: "Failed to promote user" };
      }

      // Log activity
      await this.logActivity(currentUserId, "USER_PROMOTED_TO_SUPERADMIN", {
        targetUserId: userId,
        targetEmail: user.email,
      });

      return { success: true, user };
    } catch (error) {
      console.error("Promote user error:", error);
      return { error: "An error occurred while promoting user" };
    }
  }

  // Log activity
  async logActivity(userId, action, details = {}) {
    try {
      await supabase.from("activity_logs").insert([
        {
          user_id: userId,
          action,
          details,
          user_agent: navigator.userAgent,
        },
      ]);
    } catch (error) {
      console.error("Log activity error:", error);
    }
  }
}

export default new AdminService();
