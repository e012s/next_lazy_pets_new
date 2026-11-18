/**
 * Mock experts. Any other number is rejected on the login screen.
 * Both start unregistered. After verify they share one chooser; the phone does not pick the form.
 */
export const expertAccounts = [
    { phone: "91234567", role: "pet", hkIdApproved: false },
    { phone: "98765432", role: "repair", hkIdApproved: false },
];
export function accountFor(phone) {
    const digits = phone.replace(/\D/g, "");
    return expertAccounts.find((account) => account.phone === digits) ?? null;
}
