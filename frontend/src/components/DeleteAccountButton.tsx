import { Button } from "@/components/ui/button"
import { deleteAccount } from "@/services/accountApi"

// currently in dashboard, move it when possible
const DeleteAccountButton = () => {
  const handleDelete = async () => {
    // change the confirmation method later
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;
    try {
        await deleteAccount();
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