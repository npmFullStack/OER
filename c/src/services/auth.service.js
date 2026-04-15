// src/services/auth.service.js
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

class AuthService {
  // Login user
  async login(email, password) {
    try {
      // First, get user from database
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();

      if (userError || !user) {
        return { error: "Invalid email or password" };
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          error: "Account is deactivated. Please contact administrator.",
        };
      }

      // Verify password using Supabase's crypt function
      const { data: isValid, error: verifyError } = await supabase.rpc(
        "verify_password",
        {
          user_email: email.toLowerCase(),
          user_password: password,
        },
      );

      if (verifyError || !isValid) {
        return { error: "Invalid email or password" };
      }

      // Update last login
      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", user.id);

      // Log activity
      await this.logActivity(user.id, "LOGIN", { email: user.email });

      // Create session
      const sessionToken = await this.createSession(user.id);

      // Remove password hash from user object
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        sessionToken,
      };
    } catch (error) {
      console.error("Login error:", error);
      return { error: "An error occurred during login" };
    }
  }

  // Logout user
  async logout() {
    try {
      // Get current session token from localStorage
      const sessionToken = localStorage.getItem("sessionToken");
      if (sessionToken) {
        // Delete session from database
        await supabase.from("user_sessions").delete().eq("token", sessionToken);
      }

      // Clear local storage
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("user");

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { error: "An error occurred during logout" };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const sessionToken = localStorage.getItem("sessionToken");
      if (!sessionToken) return null;

      // Verify session
      const { data: session, error: sessionError } = await supabase
        .from("user_sessions")
        .select("user_id, expires_at")
        .eq("token", sessionToken)
        .single();

      if (sessionError || !session) return null;

      // Check if session expired
      if (new Date(session.expires_at) < new Date()) {
        await supabase.from("user_sessions").delete().eq("token", sessionToken);
        localStorage.removeItem("sessionToken");
        return null;
      }

      // Get user data
      const { data: user, error: userError } = await supabase
        .from("users")
        .select(
          "id, firstname, lastname, email, role, is_active, last_login, created_at",
        )
        .eq("id", session.user_id)
        .single();

      if (userError || !user || !user.is_active) {
        localStorage.removeItem("sessionToken");
        return null;
      }

      return user;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  // Register new user (admin only)
  async register(userData) {
    try {
      const { firstname, lastname, email, password, role } = userData;

      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("email")
        .eq("email", email.toLowerCase())
        .single();

      if (existingUser) {
        return { error: "User with this email already exists" };
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert user
      const { data: user, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            firstname,
            lastname,
            email: email.toLowerCase(),
            password_hash: passwordHash,
            role: role || "admin",
          },
        ])
        .select("id, firstname, lastname, email, role, created_at")
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return { error: "Failed to create user" };
      }

      // Log activity
      await this.logActivity(user.id, "USER_REGISTERED", {
        email: user.email,
        role: user.role,
      });

      return { user };
    } catch (error) {
      console.error("Register error:", error);
      return { error: "An error occurred during registration" };
    }
  }

  // Update user profile
  async updateProfile(data) {
    try {
      const user = await this.getCurrentUser();
      if (!user) return { error: "Not authenticated" };

      const updates = {};
      if (data.firstname) updates.firstname = data.firstname;
      if (data.lastname) updates.lastname = data.lastname;
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        updates.password_hash = await bcrypt.hash(data.password, salt);
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select("id, firstname, lastname, email, role, created_at")
        .single();

      if (updateError) {
        return { error: "Failed to update profile" };
      }

      await this.logActivity(user.id, "PROFILE_UPDATED", {
        updates: Object.keys(updates),
      });

      return { user: updatedUser };
    } catch (error) {
      console.error("Update profile error:", error);
      return { error: "An error occurred during update" };
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select(
          "id, firstname, lastname, email, role, is_active, last_login, created_at",
        )
        .order("created_at", { ascending: false });

      if (error) {
        return { error: "Failed to fetch users" };
      }

      return { users };
    } catch (error) {
      console.error("Get all users error:", error);
      return { error: "An error occurred while fetching users" };
    }
  }

  // Update user role (superadmin only)
  async updateUserRole(userId, newRole) {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId)
        .select("id, firstname, lastname, email, role")
        .single();

      if (error) {
        return { error: "Failed to update user role" };
      }

      const currentUser = await this.getCurrentUser();
      await this.logActivity(currentUser.id, "USER_ROLE_UPDATED", {
        targetUserId: userId,
        newRole,
      });

      return { user };
    } catch (error) {
      console.error("Update user role error:", error);
      return { error: "An error occurred during update" };
    }
  }

  // Toggle user active status (superadmin only)
  async toggleUserStatus(userId, isActive) {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .update({ is_active: isActive })
        .eq("id", userId)
        .select("id, firstname, lastname, email, is_active")
        .single();

      if (error) {
        return { error: "Failed to update user status" };
      }

      const currentUser = await this.getCurrentUser();
      await this.logActivity(currentUser.id, "USER_STATUS_TOGGLED", {
        targetUserId: userId,
        isActive,
      });

      return { user };
    } catch (error) {
      console.error("Toggle user status error:", error);
      return { error: "An error occurred during update" };
    }
  }

  // Delete user (superadmin only)
  async deleteUser(userId) {
    try {
      const { error } = await supabase.from("users").delete().eq("id", userId);

      if (error) {
        return { error: "Failed to delete user" };
      }

      const currentUser = await this.getCurrentUser();
      await this.logActivity(currentUser.id, "USER_DELETED", {
        targetUserId: userId,
      });

      return { success: true };
    } catch (error) {
      console.error("Delete user error:", error);
      return { error: "An error occurred during deletion" };
    }
  }

  // Create session for user
  async createSession(userId) {
    const sessionToken = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await supabase.from("user_sessions").insert([
      {
        user_id: userId,
        token: sessionToken,
        expires_at: expiresAt.toISOString(),
        device_info: navigator.userAgent,
        ip_address: "0.0.0.0", // You can get real IP from request
      },
    ]);

    localStorage.setItem("sessionToken", sessionToken);
    return sessionToken;
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

  // Generate random token
  generateToken() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
}

export default new AuthService();
