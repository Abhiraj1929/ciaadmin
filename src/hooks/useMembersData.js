import { useEffect, useState, useCallback } from "react";

export function useMembersData() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });
  const [selectedMembers, setSelectedMembers] = useState([]);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: filters.status,
        search: filters.search,
      });

      const response = await fetch(`/api/members?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setMembers(result.data.members);
        setPagination((prev) => ({
          ...prev,
          total: result.data.total,
        }));
      } else {
        setError(result.error || "Failed to fetch members");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setError("Failed to load members: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.status, filters.search]);

  const deleteMember = useCallback(
    async (id, memberName) => {
      if (
        !confirm(
          `Are you sure you want to delete member "${memberName}"? This action cannot be undone.`
        )
      ) {
        return;
      }

      try {
        setDeleteLoading(true);

        const response = await fetch(`/api/members?id=${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          alert("Member deleted successfully");
          await fetchMembers();
          setSelectedMembers((prev) =>
            prev.filter((selectedId) => selectedId !== id)
          );
        } else {
          alert("Failed to delete member: " + result.error);
        }
      } catch (error) {
        console.error("Error deleting member:", error);
        alert("An error occurred while deleting member");
      } finally {
        setDeleteLoading(false);
      }
    },
    [fetchMembers]
  );

  const bulkDeleteMembers = useCallback(async () => {
    if (selectedMembers.length === 0) {
      alert("Please select members to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedMembers.length} selected members? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(true);

      const deletePromises = selectedMembers.map((id) =>
        fetch(`/api/members?id=${id}`, { method: "DELETE" })
      );

      const responses = await Promise.all(deletePromises);
      const results = await Promise.all(responses.map((r) => r.json()));

      const successful = results.filter((r) => r.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        alert(
          `${successful} members deleted successfully${
            failed > 0 ? `, ${failed} failed` : ""
          }`
        );
        await fetchMembers();
        setSelectedMembers([]);
      } else {
        alert("Failed to delete any members");
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      alert("An error occurred during bulk delete");
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedMembers, fetchMembers]);

  useEffect(() => {
    fetchMembers();
  }, [pagination.page, pagination.limit, filters.status]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== undefined) {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchMembers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  return {
    members,
    loading,
    error,
    deleteLoading,
    pagination,
    filters,
    selectedMembers,
    setPagination,
    setFilters,
    setSelectedMembers,
    fetchMembers,
    deleteMember,
    bulkDeleteMembers,
  };
}
