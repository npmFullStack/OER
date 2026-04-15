// seed.js - Run this to add superadmin with proper password hash
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSuperAdmin() {
  try {
    // Check if superadmin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", "admin@occ.edu")
      .single();

    if (existingAdmin) {
      console.log("Superadmin already exists. Updating password...");
      // Update password if exists
      const passwordHash = await bcrypt.hash("password", 10);
      const { error: updateError } = await supabase
        .from("users")
        .update({
          password_hash: passwordHash,
          firstname: "OCCLIB",
          lastname: "ADMIN",
          role: "superadmin",
          is_active: true,
        })
        .eq("email", "admin@occ.edu");

      if (updateError) {
        console.error("Error updating superadmin:", updateError);
      } else {
        console.log("Superadmin password updated successfully!");
      }
    } else {
      // Create new superadmin
      const passwordHash = await bcrypt.hash("password", 10);
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            firstname: "OCCLIB",
            lastname: "ADMIN",
            email: "admin@occ.edu",
            password_hash: passwordHash,
            role: "superadmin",
            is_active: true,
          },
        ])
        .select();

      if (insertError) {
        console.error("Error creating superadmin:", insertError);
      } else {
        console.log("Superadmin created successfully!");
        console.log("Email: admin@occ.edu");
        console.log("Password: password");
      }
    }
  } catch (error) {
    console.error("Seed error:", error);
  }
}

seedSuperAdmin();
