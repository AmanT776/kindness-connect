import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserData } from '@/services/users';
import { getCurrentUser, updateProfile, changePassword } from '@/services/auth';
import { getOrganizationalUnitById, OrganizationalUnit } from '@/services/organizationalUnits';
import { getUnitTypeById, UnitType } from '@/services/unitTypes';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Building, Lock } from 'lucide-react';

export default function Profile() {
    const { user: authUser, logout } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserData | null>(null);
    const [unit, setUnit] = useState<OrganizationalUnit | null>(null);
    const [unitType, setUnitType] = useState<UnitType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);


    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getCurrentUser();
                if (response.success && response.data) {
                    const userData = response.data as unknown as UserData;
                    setUser(userData);
                    setFirstName(userData.firstName);
                    setLastName(userData.lastName);
                    setEmail(userData.email);

                    // Fetch organizational unit if ID exists
                    if (userData.organizationalUnitId) {
                        const unitData = await getOrganizationalUnitById(Number(userData.organizationalUnitId));
                        if (unitData) {
                            setUnit(unitData);
                            if (unitData.unitTypeId) {
                                const typeData = await getUnitTypeById(unitData.unitTypeId);
                                if (typeData) {
                                    setUnitType(typeData);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load profile details',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!user) return; // authUser check removed as per previous user edit, but safe to keep user check

        setIsSaving(true);
        try {
            const isEmailChanged = email !== user.email;

            await updateProfile({
                firstName,
                lastName,
                email
            });

            if (isEmailChanged) {
                toast({
                    title: 'Email Changed',
                    description: 'Please log in again with your new email.',
                });
                logout();
                navigate('/login');
            } else {
                toast({
                    title: 'Success',
                    description: 'Profile updated successfully',
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: 'Error',
                description: 'Failed to update profile',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast({
                title: "Error",
                description: "Please fill in all password fields",
                variant: "destructive",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: 'Error',
                description: 'New password and confirm password do not match',
                variant: 'destructive',
            });
            return;
        }

        setIsChangingPassword(true);
        try {
            await changePassword({
                currentPassword,
                newPassword,
                confirmPassword
            });

            toast({
                title: 'Success',
                description: 'Password changed successfully',
            });

            // Reset password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            const message = error?.response?.data?.message || 'Failed to change password';
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <div className="container py-8">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-muted-foreground">User profile not found.</p>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container max-w-2xl py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Profile Settings</h1>
                    <p className="text-muted-foreground">Manage your personal information</p>
                </div>

                <div className="grid gap-6">
                    {/* Public Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>Details managed by the administrator</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                <Building className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">{unitType?.name || 'Unit Type'}</p>
                                    <p className="text-sm text-muted-foreground">{unit?.name || user.organizationalUnitName || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Role</p>
                                    <p className="text-sm text-muted-foreground">{user.roleName}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Info Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Details</CardTitle>
                            <CardDescription>Update your contact information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Password Change Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Change your password</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="pl-9"
                                        placeholder="Enter current password"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pl-9"
                                        placeholder="Enter new password"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-9"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Change Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout >
    );
}
