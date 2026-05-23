import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../../assets/logo.svg";
import { Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-muted/30 border-t px-3">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="logo" />
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("footer.brandDescription")}
            </p>
            {/* <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-xl">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link
                  to="/cars"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("footer.ourCars")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("footer.contact")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("footer.faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-xl">
              {t("footer.services")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">
                {t("footer.airportTransfers")}
              </li>
              <li className="text-muted-foreground">
                {t("footer.longTermRentals")}
              </li>
              <li className="text-muted-foreground">
                {t("footer.corporateAccounts")}
              </li>
              <li className="text-muted-foreground">
                {t("footer.chauffeuredServices")}
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-xl">
              {t("footer.contactUs")}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground">
                  {t("footer.address")}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground">+93 766303465</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground">
                  info@carrental.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CarRental. {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
