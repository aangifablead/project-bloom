import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Bell, Palette, Lock, Camera, Loader2, Eye, EyeOff, ShieldCheck, ShieldAlert } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Avatar } from '@/components/common/Avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import useApi from '@/hooks/apiHook';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const safeUser = user as {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    isTwoFactorEnabled?: boolean;
  } | null;

  const { execute, loading: isChangingPassword } = useApi();
  const { execute: execute2FA, loading: is2FALoading } = useApi();
  const { execute: executeProfile, loading: isSavingProfile } = useApi();

  const [profile, setProfile] = useState({
    name: safeUser?.name || '',
    email: safeUser?.email || '',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const [is2FAEnabled, setIs2FAEnabled] = useState(safeUser?.isTwoFactorEnabled || false);
  const [showQRSetup, setShowQRSetup] = useState(false);
  const [qrCodeDataUri, setQrCodeDataUri] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskAssigned: true,
    taskCompleted: true,
    mentions: true,
    weeklyDigest: false,
  });

  // Keep state synchronized if user context shifts or hydrates late
  useEffect(() => {
    if (safeUser) {
      setProfile({
        name: safeUser.name || '',
        email: safeUser.email || '',
      });
      setIs2FAEnabled(safeUser.isTwoFactorEnabled || false);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    const targetUserId = safeUser?._id || safeUser?.id;
    if (!targetUserId) return;

    const { data, error } = await executeProfile(`/users/profile/${targetUserId}`, 'PUT', {
      name: profile.name,
      email: profile.email,
    });

    if (data) {
      toast({
        title: 'Profile updated',
        description: 'Your user details have been saved successfully.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error || 'Could not commit profile changes.',
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please ensure your new password and confirmation match exactly.',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'New password must be at least 6 characters long.',
      });
      return;
    }

    const { data, error } = await execute('/auth/change-password', 'POST', {
      currentPassword,
      newPassword,
    });

    if (data) {
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error || 'Could not update your password.',
      });
    }
  };

  const handleToggle2FA = async (checked: boolean) => {
    if (!checked) {
      setIs2FAEnabled(false);
      setShowQRSetup(false);
      setQrCodeDataUri(null);
      return;
    }

    const targetUserId = safeUser?._id || safeUser?.id;
    if (!targetUserId) {
      toast({
        variant: 'destructive',
        title: 'Context Error',
        description: 'Could not resolve your user tracking ID. Try logging in again.',
      });
      return;
    }

    const response = await execute2FA('/auth/2fa/enable', 'POST', {
      userId: targetUserId,
    });

    if (response.error) {
      toast({
        variant: 'destructive',
        title: 'Setup Failed',
        description: response.error || 'Could not fetch initialization token data.',
      });
    } else {
      if (response.data?.qrCodeUrl) {
        setQrCodeDataUri(response.data.qrCodeUrl);
        setShowQRSetup(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Payload Error',
          description: 'Backend responded successfully, but did not supply a valid qrCodeUrl.',
        });
      }
    }
  };

  const handleVerify2FACode = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetUserId = safeUser?._id || safeUser?.id;
    if (!targetUserId) {
      toast({ variant: 'destructive', title: 'Error', description: 'User ID context was lost.' });
      return;
    }

    const { data, error } = await execute2FA('/auth/2fa/verify', 'POST', {
      userId: targetUserId,
      code: verificationCode
    });

    if (data) {
      setIs2FAEnabled(true);
      setShowQRSetup(false);
      setVerificationCode('');
      toast({ title: 'Security Activated', description: 'Two-factor authentication successfully linked.' });
    } else {
      toast({ variant: 'destructive', title: 'Invalid Code', description: error || 'Verification failed.' });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="profile" className="gap-2">
            <UserIcon className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Content */}
        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and photo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar src={safeUser?.avatar} name={profile.name || 'User'} size="xl" className="w-20 h-20" />
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{profile.name || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Content */}
        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <h4 className="font-medium text-foreground">Activity Notifications</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'taskAssigned', label: 'Task assigned to me' },
                      { key: 'taskCompleted', label: 'Task completed' },
                      { key: 'mentions', label: 'Mentions' },
                      { key: 'weeklyDigest', label: 'Weekly digest' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications]}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Appearance Content */}
        <TabsContent value="appearance">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all text-center capitalize',
                          theme === t ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full mx-auto mb-2',
                            t === 'light' && 'bg-white border border-border',
                            t === 'dark' && 'bg-slate-900',
                            t === 'system' && 'bg-gradient-to-br from-white to-slate-900'
                          )}
                        />
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Content */}
        <TabsContent value="security" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2 relative">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-2 relative">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-2 relative">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={isChangingPassword} className="min-w-[140px]">
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Two-Factor Authentication (2FA)</span>
                  {is2FAEnabled ? (
                    <span className="text-xs font-normal bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Enabled
                    </span>
                  ) : (
                    <span className="text-xs font-normal bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Disabled
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Add an extra layer of security to your profile using an authenticator app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h4 className="font-medium text-foreground">Secure with TOTP Authenticator</h4>
                    <p className="text-sm text-muted-foreground">Require a verification code when logging into your account.</p>
                  </div>
                  <Switch
                    checked={is2FAEnabled || showQRSetup}
                    disabled={is2FALoading}
                    onCheckedChange={(checked: boolean) => handleToggle2FA(checked)}
                  />
                </div>

                {showQRSetup && qrCodeDataUri && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row gap-6 items-center bg-muted/40 p-4 rounded-lg border border-border">
                      <div className="bg-white p-3 rounded-md shadow-sm border border-border flex items-center justify-center">
                        <QRCodeSVG value={qrCodeDataUri} size={144} level="H" />
                      </div>
                      <div className="space-y-2 text-center sm:text-left">
                        <h5 className="font-semibold text-sm">Scan QR Code</h5>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          Open your authentication app (Google Authenticator, Authy, or Microsoft Authenticator) and scan the QR pattern, then provide the 6-digit verification code below.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleVerify2FACode} className="flex gap-3 items-end max-w-sm">
                      <div className="grid gap-2 flex-1">
                        <Label htmlFor="verification-code">Verification Token</Label>
                        <Input
                          id="verification-code"
                          placeholder="000 000"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          className="font-mono tracking-widest text-center"
                          required
                        />
                      </div>
                      <Button type="submit" disabled={is2FALoading}>
                        {is2FALoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Enable'}
                      </Button>
                    </form>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};