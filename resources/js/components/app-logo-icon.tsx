type AppLogoIconProps = {
    className?: string;
};
export default function AppLogoIcon({ className }: AppLogoIconProps) {
    return (
        <img
            src="assets/img/logo_simbaris_icon.png"
            alt="Logo"
            className={className}
        />
    );
}
