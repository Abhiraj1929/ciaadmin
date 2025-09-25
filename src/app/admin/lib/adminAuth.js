import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const checkAdminAuth = async () => {
  const supabase = createClientComponentClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { isAuthenticated: false, isAdmin: false, user: null };
    }

    // Check admin table
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("email", user.email)
      .single();

    return {
      isAuthenticated: true,
      isAdmin: !adminError && adminData,
      user: user,
      adminData: adminData,
    };
  } catch {
    return { isAuthenticated: false, isAdmin: false, user: null };
  }
};

export const generateMemberCredentials = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const passwordLength = 8;
  let password = "";

  for (let i = 0; i < passwordLength; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return password;
};
