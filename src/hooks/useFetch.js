import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { jwtDecode } from "jwt-decode";
import { URL } from "../utils/api";

// Local Storage Keys
const TOKEN_KEY = "adminToken";
const USER_KEY = "adminData";

// -------------------- Token Utils --------------------
export const isTokenValid = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() <= exp * 1000;
  } catch (err) {
    return false;
  }
};

// -------------------- Core API Call --------------------
export const apiCall = async ({
  pathname,
  method = "GET",
  data = null,
  isFormData = false,
  auth = true,
}) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");

    // Token validity check
    if (auth && (!token || !isTokenValid(token))) {
      console.warn("Token invalid or expired.");
      return { error: true, unauthorized: true, message: "Token expired" };
    }

    const headers = new Headers();
    if (auth && token) headers.append("Authorization", `Bearer ${token}`);

    let body = null;

    if (data) {
      if (isFormData) {
        // ✅ If already FormData, use it directly
        if (data instanceof FormData) {
          body = data;
        } else {
          // ✅ If it's a plain object, convert it
          const formData = new FormData();
          Object.entries(data).forEach(([k, v]) => formData.append(k, v));
          body = formData;
        }
        // ⚠️ DO NOT manually set Content-Type here
      } else {
        headers.append("Content-Type", "application/json");
        body = JSON.stringify(data);
      }
    }

    const res = await fetch(`${URL}${pathname}`, {
      method,
      headers,
      body,
    });

    const jsonRes = await res.json();

    if (
      res.status === 401 ||
      jsonRes.status === 401 ||
      jsonRes.message === "Unauthorized"
    ) {
      console.warn("Unauthorized API call");
      return { error: true, unauthorized: true, message: "Unauthorized" };
    }

    return jsonRes;
  } catch (err) {
    console.error("API Call Error:", err);
    return { error: true, message: err.message };
  }
};


// -------------------- useFetch Hook --------------------
const defaultTransform = (data) => data; // stable reference

const useFetch = (endpoint, options = {}) => {
  const {
    immediate = true,
    showSuccessMessage = false,
    showErrorMessage = true,
    successMessage = "تم بنجاح",
    errorMessage = "حدث خطأ أثناء تحميل البيانات",
    transform = defaultTransform, // ✅ stable function
    auth = true,
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false); // ✅ prevents re-entry

  // -------------------- Fetch Data --------------------
  const fetchData = useCallback(
    async (customEndpoint = endpoint) => {
      if (!customEndpoint || fetching) return;

      setFetching(true);
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall({
          pathname: customEndpoint,
          method: "GET",
          auth,
        });

        if (response?.unauthorized) {
          message.warning("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا");
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          window.location.href = "/"; // Safe redirect once
          return;
        }

        if (response && !response.error) {
          const transformed = transform(response);
          setData(transformed);
          if (showSuccessMessage) message.success(successMessage);
        } else {
          throw new Error(response?.message || "API Error");
        }
      } catch (err) {
        setError(err);
        if (showErrorMessage) message.error(err.message || errorMessage);
      } finally {
        setFetching(false);
        setLoading(false);
      }
    },
    [endpoint, transform, auth, showErrorMessage, showSuccessMessage, successMessage, errorMessage, fetching]
  );

  // -------------------- CRUD Operations --------------------
  const create = useCallback(
    async (itemData, customEndpoint = endpoint, isFormData = false) => {
      setLoading(true);
      try {
        const response = await apiCall({
          pathname: customEndpoint,
          method: "POST",
          data: itemData,
          isFormData,
          auth,
        });

        if (response && !response.error) {
          const newItem = transform(response);
          setData((prev) =>
            Array.isArray(prev) ? [...prev, newItem] : [newItem]
          );
          message.success("تم إنشاء العنصر بنجاح");
          return newItem;
        } else {
          throw new Error(response?.message || "Create failed");
        }
      } catch (error) {
        message.error("فشل في إنشاء العنصر");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, transform, auth]
  );

  const update = useCallback(
    async (id, itemData, customEndpoint = `${endpoint}/${id}`, isFormData = false) => {
      setLoading(true);
      try {
        const response = await apiCall({
          pathname: customEndpoint,
          method: "PUT",
          data: itemData,
          isFormData,
          auth,
        });

        if (response && !response.error) {
          const updated = transform(response);
          setData((prev) =>
            Array.isArray(prev)
              ? prev.map((item) => (item.id === id ? updated : item))
              : updated
          );
          message.success("تم تحديث العنصر بنجاح");
          return updated;
        } else {
          throw new Error(response?.message || "Update failed");
        }
      } catch (error) {
        message.error("فشل في تحديث العنصر");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, transform, auth]
  );

  const remove = useCallback(
    async (id, customEndpoint = `${endpoint}/${id}`) => {
      setLoading(true);
      try {
        const response = await apiCall({
          pathname: customEndpoint,
          method: "DELETE",
          auth,
        });

        if (response && !response.error) {
          setData((prev) =>
            Array.isArray(prev)
              ? prev.filter((item) => item.id !== id)
              : null
          );
          message.success("تم حذف العنصر بنجاح");
        } else {
          throw new Error(response?.message || "Delete failed");
        }
      } catch (error) {
        message.error("فشل في حذف العنصر");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, auth]
  );

  const patch = useCallback(
    async (id, itemData, customEndpoint = `${endpoint}/${id}`) => {
      try {
        const response = await apiCall({
          pathname: customEndpoint,
          method: "PATCH",
          data: itemData,
          auth,
        });

        if (response && !response.error) {
          const updated = transform(response);
          setData((prev) =>
            Array.isArray(prev)
              ? prev.map((item) =>
                  item.id === id ? { ...item, ...updated } : item
                )
              : updated
          );
          return updated;
        } else {
          throw new Error(response?.message || "Patch failed");
        }
      } catch (error) {
        message.error("فشل في تحديث العنصر");
        throw error;
      }
    },
    [endpoint, transform, auth]
  );

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // -------------------- Initial Fetch --------------------
  useEffect(() => {
    if (immediate && endpoint) {
      fetchData(); // ✅ runs once or when endpoint changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, immediate]);

  // -------------------- Return --------------------
  return {
    data,
    loading,
    error,
    fetchData,
    create,
    update,
    remove,
    patch,
    refetch,
  };
};

export default useFetch;
