type AppLogoIconProps = {
    className?: string;
};
export default function AppLogoIcon({ className }: AppLogoIconProps) {
    return (
        <img
            src="/favicon.ico"
            alt="Logo"
            className={className}
        />
    );
}
