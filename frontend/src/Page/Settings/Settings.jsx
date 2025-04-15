import React, { useState } from "react";
import {
    User, UserRoundPen, Lock, Mail, Phone, MapPin, Calendar, CheckCircle,
    KeyRound, Save, SlidersHorizontal, ChefHat, Accessibility, School
} from "lucide-react";
// import './settings.css';

export default function Settings() {
    // const [formData, setFormData] = useState({
    //     fullName: "",
    //     gender: "",
    //     dob: "",
    //     email: "",
    //     phone: "",
    //     address: "",
    //     preferredClass: "",
    //     mealPreference: "",
    //     specialAssistance: false,
    //     password: "",
    //     confirmPassword: "",
    // });

    // For testing
    const [formData, setFormData] = useState({
        fullName: "Binh Chan",
        gender: "male",
        dob: "1990-01-01",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        address: "123 Main St",
        preferredClass: "first",
        mealPreference: "veg",
        specialAssistance: false,
        password: "",
        confirmPassword: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [notification, setNotification] = useState("");
    const [showNotification, setShowNotification] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Updated Settings:", formData);
        setIsEditing(false);
        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
        }, 3000);
    };


    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    return (
        <div className="animate-fadeInUp max-w-3xl mx-auto p-4 space-y-6">
            <div className="flex justify-around border-b">
                {[
                    {
                        key: "profile",
                        icon: <User className="w-4 h-4" />,
                        label: "Profile"
                    },
                    {
                        key: "preferences",
                        icon: <SlidersHorizontal className="w-4 h-4" />,
                        label: "Preferences"
                    },
                    {
                        key: "security",
                        icon: <Lock className="w-4 h-4" />,
                        label: "Security"
                    }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 ${activeTab === tab.key ? "border-blue-600 font-semibold text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600"}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                {activeTab === "profile" && (
                    <>
                        <h2 className="text-xl font-bold flex items-center gap-2"><User /> Personal Information</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="font-bold mb-1 text-blue-600 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </label>
                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 text-blue-600 flex items-center gap-2">
                                    <UserRoundPen className="w-4 h-4" />
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-blue-600 font-bold mb-1 flex items-center gap-1"><Calendar className="w-4 h-4" /> Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-blue-600 font-bold mb-1 flex items-center gap-1"><Mail className="w-4 h-4" /> Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-blue-600 font-bold mb-1 flex items-center gap-1"><Phone className="w-4 h-4" /> Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-blue-600 font-bold mb-1 flex items-center gap-1"><MapPin className="w-4 h-4" /> Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "preferences" && (
                    <>
                        <h2 className="text-xl font-bold flex items-center gap-2"><SlidersHorizontal /> Travel Preferences</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-blue-600 font-bold mb-1 flex items-center gap-2">
                                    <School className="w-4 h-4" />
                                    Preferred Class
                                </label>
                                <select
                                    name="preferredClass"
                                    value={formData.preferredClass}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="first">First Class</option>
                                    <option value="second">Second Class</option>
                                    <option value="sleeper">Sleeper</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-blue-600 font-bold mb-1 flex items-center gap-1"><ChefHat className="w-4 h-4" /> Meal Preference</label>
                                <select
                                    name="mealPreference"
                                    value={formData.mealPreference}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="veg">Vegetarian</option>
                                    <option value="non-veg">Non-Vegetarian</option>
                                    <option value="vegan">Vegan</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="specialAssistance"
                                    checked={formData.specialAssistance}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <label className="flex items-center gap-1"><Accessibility className="w-4 h-4" /> Require Special Assistance</label>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "security" && (
                    <>
                        <h2 className="text-xl font-bold flex items-center gap-2"><KeyRound /> Security Settings</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-blue-600 font-bold mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-blue-600 font-bold mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="flex justify-end pt-4">
                    {isEditing && (
                        <button type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    )}
                    {!isEditing && (
                        <button type="button"
                            onClick={handleEditToggle}
                            className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Change Information
                        </button>
                    )}
                </div>

                {showNotification && (
                    <div
                        className={`mt-4 transition-all duration-700 ease-in-out 
                                    ${showNotification ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'} 
                                bg-green-100 text-green-800 px-4 py-3 rounded shadow text-center`}
                    >
                        Changes have been saved successfully ✅
                    </div>
                )}
            </form>
        </div>
    );
}
