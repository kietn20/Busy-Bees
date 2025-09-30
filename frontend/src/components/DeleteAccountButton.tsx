import { Button } from "@/components/ui/button"
import { deleteAccount } from "@/services/accountApi"
import { useAuth } from "@/context/AuthContext"; // adjust import path as needed

// currently in dashboard, move it when possible
const DeleteAccountButton = () => {
  const { token } = useAuth(); // token for JWT auth

  const handleDelete = async () => {
    // change the confirmation method later
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;
    try {
        await deleteAccount(token);
        // Redirect to whatever page makes sense after account deletion
    } catch (error: any) {
        alert("Error deleting account: " + error.message);
    }
  };

  return (
    <Button
      variant="destructive"
      size="lg"
      onClick={handleDelete}
      style={{ position: "fixed", right: 20, top: 20 }}
    >
      Delete Account
    </Button>
  );
};

export default DeleteAccountButton;