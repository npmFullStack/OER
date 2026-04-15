// src/services/email.service.js
import toast from "react-hot-toast";

class EmailService {
  constructor() {
    // Use the email server port (3001) instead of 5000
    this.apiUrl =
      import.meta.env.VITE_EMAIL_API_URL || "http://localhost:3001/api";
  }

  // Send welcome email to new admin
  async sendWelcomeEmail(email, firstName, lastName, tempPassword) {
    try {
      const response = await fetch(`${this.apiUrl}/send-welcome-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          tempPassword,
          loginUrl: `${window.location.origin}/login`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send email");
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Send welcome email error:", error);
      return { success: false, error: error.message };
    }
  }

  // Send account status change notification
  async sendAccountStatusEmail(
    email,
    firstName,
    lastName,
    status,
    reason = "",
  ) {
    try {
      const response = await fetch(`${this.apiUrl}/send-status-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          status,
          reason,
          loginUrl: `${window.location.origin}/login`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send status email");
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Send status email error:", error);
      return { success: false, error: error.message };
    }
  }

  // Send role change notification
  async sendRoleChangeEmail(email, firstName, lastName, oldRole, newRole) {
    try {
      const response = await fetch(`${this.apiUrl}/send-role-change-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          oldRole,
          newRole,
          loginUrl: `${window.location.origin}/login`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send role change email");
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Send role change email error:", error);
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  async testEmail(email) {
    try {
      const response = await fetch(`${this.apiUrl}/test-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send test email");
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Test email error:", error);
      return { success: false, error: error.message };
    }
  }

  // Check email server health
  async checkHealth() {
    try {
      const response = await fetch(`${this.apiUrl}/email-health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Health check error:", error);
      return { status: "offline", error: error.message };
    }
  }
}

export default new EmailService();
