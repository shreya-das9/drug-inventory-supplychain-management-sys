export const logout = async (req, res) => {
  try {
    // In JWT-based auth, logout is handled client-side by removing the token
    // This endpoint serves as a confirmation and can log the logout event if needed
    
    const userId = req.user?.id;
    
    // Log the logout event for audit purposes
    console.log(`✅ User ${userId} logged out successfully`);
    
    res.status(200).json({
      success: true,
      message: "Logout successful",
      data: {
        token: null,
      },
    });
  } catch (error) {
    console.error("❌ Logout Error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};
