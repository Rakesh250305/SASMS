import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { User, X } from "lucide-react";
import BottomNav from "../../component/BottomNav";

export default function UserProfile() {
    const apiUrl = import.meta.env.VITE_BACKEND_URL;
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState("profile");
    const [form, setForm] = useState({ name: "", email: "", phone: "" });
    const [pwForm, setPwForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirm: ""
    });

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [addresses, setAddresses] = useState([]);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [showAddressModal, setShowAddressModal] = useState(false);

    const [addAddressModal, setAddAddressModal] = useState(false);

    const [newAddress, setNewAddress] = useState({
        label: "home",
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: ""
    });

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {

        const fetchUser = async () => {
            try {

                const res = await axios.get(
                    `${apiUrl}/user`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                setUser(res.data.data);

            } catch (err) {

                if (err.response?.status === 401) {
                    navigate("/login");
                }

            }
        };

        fetchUser();

    }, []);

    useEffect(() => {

        if (user) {
            setForm({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || ""
            });
        }

        axios
            .get(`${apiUrl}/user/address`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => setAddresses(res.data.addresses || []));

    }, [user]);

    const saveProfile = async () => {

        setSaving(true);
        setMsg("");

        try {

            await axios.put(
                `${apiUrl}/user/profile`,
                { name: form.name, phone: form.phone },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMsg("Profile updated successfully");

        } catch (err) {

            setMsg("Error updating profile");

        }

        setSaving(false);

    };

    const changePassword = async () => {

        if (pwForm.newPassword !== pwForm.confirm) {
            setMsg("Passwords do not match");
            return;
        }

        setSaving(true);

        try {

            await axios.put(
                `${apiUrl}/user/change-password`,
                {
                    currentPassword: pwForm.currentPassword,
                    newPassword: pwForm.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMsg("Password updated successfully");

            setPwForm({
                currentPassword: "",
                newPassword: "",
                confirm: ""
            });

        } catch {

            setMsg("Error changing password");

        }

        setSaving(false);

    };

    const deleteAddress = async (id) => {

        await axios.delete(
            `${apiUrl}/user/address/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setAddresses((prev) => prev.filter((a) => a._id !== id));

    };

    const saveAddress = async () => {

        try {

            const res = await axios.post(
                `${apiUrl}/user/address`,
                newAddress,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setAddresses((prev) => [...prev, res.data.address]);

            setAddAddressModal(false);

            setNewAddress({
                label: "home",
                fullName: "",
                phone: "",
                addressLine1: "",
                addressLine2: "",
                city: "",
                state: "",
                pincode: ""
            });

        } catch (err) {

            console.error(err);

        }

    };

    const updateAddress = async () => {

        try {

            const res = await axios.put(
                `${apiUrl}/user/address/${selectedAddress._id}`,
                newAddress,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setAddresses((prev) =>
                prev.map((a) =>
                    a._id === selectedAddress._id ? res.data.address : a
                )
            );

            setAddAddressModal(false);

        } catch (err) {
            console.log(err);
        }

    };

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    if (!user) return null;

    return (

        <div className="min-h-screen bg-slate-50">

            {/* Header */}

            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white px-5 pt-6 pb-10">

                <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold">
                        {user.name?.[0]?.toUpperCase()}
                    </div>

                    <div>
                        <p className="font-bold">{user.name}</p>
                        <p className="text-sm opacity-80">{user.email}</p>
                    </div>

                </div>

            </div>


            <div className="px-4 -mt-6 pb-20">

                {/* Tabs */}

                <div className="flex gap-2 mb-4">

                    {["profile", "addresses"].map((t) => (

                        <button
                            key={t}
                            onClick={() => {
                                setTab(t);
                                setMsg("");
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize
              ${tab === t
                                    ? "bg-emerald-600 text-white"
                                    : "bg-white text-gray-600 border"
                                }`}
                        >
                            {t}
                        </button>

                    ))}

                </div>

                {/* Message */}

                {msg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-sm mb-4">
                        {msg}
                    </div>
                )}

                {/* PROFILE TAB */}

                {tab === "profile" && (

                    <div className="bg-white rounded-xl shadow-sm p-4">

                        <h3 className="font-semibold mb-3">Personal Information</h3>

                        <input
                            className="w-full border rounded-lg px-3 py-2 mb-3"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder="Full Name"
                        />

                        <input
                            disabled
                            className="w-full border rounded-lg px-3 py-2 mb-3 bg-gray-100"
                            value={form.email}
                        />

                        <input
                            className="w-full border rounded-lg px-3 py-2 mb-4"
                            value={form.phone}
                            onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                            }
                            placeholder="Phone"
                        />

                        <button
                            onClick={saveProfile}
                            className="w-full bg-emerald-600 text-white py-2 rounded-lg"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>

                    </div>

                )}

                {/* ADDRESS TAB */}

                {tab === "addresses" && (

                    <div>

                        <button
                            onClick={() => {
                                setAddAddressModal(true)
                                setNewAddress({
                                    label: "home",
                                    fullName: "",
                                    phone: "",
                                    addressLine1: "",
                                    addressLine2: "",
                                    city: "",
                                    state: "",
                                    pincode: ""
                                });
                            }
                            }
                            className="w-full border border-dashed border-emerald-400 text-emerald-600 py-2 rounded-lg mb-4"
                        >
                            + Add New Address
                        </button>

                        <div className="space-y-3">

                            {addresses.length === 0 && (
                                <div className="text-center text-gray-400 py-6">
                                    No saved addresses
                                </div>
                            )}

                            {addresses.map((addr) => (

                                <div
                                    key={addr._id}
                                    className="bg-white rounded-xl shadow-sm p-4 relative"
                                >

                                    <div className="text-xs text-emerald-600 font-bold uppercase mb-1">
                                        {addr.label}
                                    </div>

                                    <div className="text-sm font-semibold">
                                        {addr.fullName} · {addr.phone}
                                    </div>

                                    <div className="text-xs text-gray-500 mt-1">
                                        {addr.addressLine1},{" "}
                                        {addr.city}, {addr.state} - {addr.pincode}
                                    </div>

                                    <div className="flex justify-evenly mt-3 text-xs w-full ">

                                        <button
                                            className="text-blue-600 px-6 py-1 bg-blue-50  "
                                            onClick={() => {
                                                setSelectedAddress(addr);
                                                setShowAddressModal(true);
                                            }}
                                        >
                                            View
                                        </button>

                                        <button
                                            className="text-emerald-600 px-6 py-1 bg-emerald-50"
                                            onClick={() => {
                                                setSelectedAddress(addr);
                                                setNewAddress(addr);
                                                setAddAddressModal(true);
                                                setIsEditMode(true);
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="text-red-500 px-6 py-1 bg-red-50"
                                            onClick={() => {
                                                setSelectedAddress(addr);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            Delete
                                        </button>

                                    </div>


                                </div>

                            ))}

                        </div>

                    </div>

                )}

            </div>

            {/* View Modal  */}
            <AnimatePresence>
                {showAddressModal && selectedAddress && (

                    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ duration: 0.3 }}
                            className="w-full bg-white h-[60vh] rounded-t-3xl p-6 overflow-y-auto"
                        >

                            {/* Header */}

                            <div className="flex justify-between items-center mb-4">

                                <span className="bg-blue-50 px-4 py-1 text-blue-600 rounded-full text-sm font-semibold capitalize">
                                    {selectedAddress.label}
                                </span>

                                <button
                                    onClick={() => setShowAddressModal(false)}
                                    className="bg-gray-100 p-2 rounded-full"
                                >
                                    <X size={18} />
                                </button>

                            </div>

                            {/* Address Details */}

                            <div className="space-y-4 text-sm">

                                <div>
                                    <p className="text-gray-400 text-xs">Full Name</p>
                                    <p className="font-semibold">{selectedAddress.fullName}</p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-xs">Phone</p>
                                    <p className="font-semibold">{selectedAddress.phone}</p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-xs">Address</p>
                                    <p className="font-semibold">
                                        {selectedAddress.addressLine1} {selectedAddress.addressLine2}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">

                                    <div>
                                        <p className="text-gray-400 text-xs">City</p>
                                        <p className="font-semibold">{selectedAddress.city}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-400 text-xs">State</p>
                                        <p className="font-semibold">{selectedAddress.state}</p>
                                    </div>

                                </div>

                                <div>
                                    <p className="text-gray-400 text-xs">Pincode</p>
                                    <p className="font-semibold">{selectedAddress.pincode}</p>
                                </div>

                            </div>

                        </motion.div>

                    </div>

                )}
            </AnimatePresence>

            {/* Edit and Add modal */}
            <AnimatePresence>
                {addAddressModal && (

                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="absolute bottom-0 left-0 right-0 bg-white h-[60vh] rounded-t-3xl p-6 z-50 overflow-y-auto"
                        >


                            <h3 className="font-semibold text-lg mb-4">
                                {isEditMode ? "Edit Address" : "Add New Address"}
                            </h3>

                            <div className="space-y-3">

                                <input
                                    placeholder="Full Name"
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={newAddress.fullName}
                                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                />

                                <input
                                    placeholder="Phone"
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={newAddress.phone}
                                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                />

                                <input
                                    placeholder="Address Line 1"
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={newAddress.addressLine1}
                                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                                />

                                <input
                                    placeholder="Address Line 2"
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={newAddress.addressLine2}
                                    onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                                />

                                <div className="grid grid-cols-2 gap-2">

                                    <input
                                        placeholder="City"
                                        className="border rounded-lg px-3 py-2"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                    />

                                    <input
                                        placeholder="State"
                                        className="border rounded-lg px-3 py-2"
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                    />

                                </div>

                                <input
                                    placeholder="Pincode"
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={newAddress.pincode}
                                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                />

                                <select
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={newAddress.label}
                                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                >
                                    <option value="home">Home</option>
                                    <option value="office">Office</option>
                                    <option value="other">Other</option>
                                </select>

                            </div>

                            <div className="flex gap-3 mt-5">

                                <button
                                    onClick={() => setAddAddressModal(false)}
                                    className="flex-1 border rounded-lg py-2"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={isEditMode ? updateAddress : saveAddress}
                                    className="flex-1 bg-emerald-600 text-white rounded-lg py-2"
                                >
                                    {isEditMode ? "Update Address" : "Save Address"}
                                </button>

                            </div>

                        </motion.div>

                    </div>

                )}
            </AnimatePresence>

            {/* Delete Modal  */}
            <AnimatePresence>
                {showDeleteModal && (

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    >

                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white rounded-xl p-6 w-[320px]"
                        >

                            <h3 className="font-semibold text-lg mb-2">
                                Delete Address
                            </h3>

                            <p className="text-sm text-gray-500 mb-5">
                                Are you sure you want to delete this address?
                            </p>

                            <div className="flex gap-3">

                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 border py-2 rounded-lg"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => {
                                        deleteAddress(selectedAddress._id)
                                        setShowDeleteModal(false)
                                    }}
                                    className="flex-1 bg-red-500 text-white py-2 rounded-lg"
                                >
                                    Delete
                                </button>

                            </div>

                        </motion.div>

                    </motion.div>

                )}
            </AnimatePresence>

                <BottomNav/>
        </div>

    );
}