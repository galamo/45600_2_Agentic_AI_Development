import CompanyCard from "../components/CompanyCard";
import type { Company } from "../interfaces";

const companies: Company[] = [
    {
        id: 1,
        name: "TechNova Solutions",
        address: "500 Market St, San Francisco, CA 94105",
        employeeCount: 450,
        budget: 12_000_000,
    },
    {
        id: 2,
        name: "GreenLeaf Industries",
        address: "220 Pine Ave, Portland, OR 97204",
        employeeCount: 120,
        budget: 3_500_000,
    },
    {
        id: 3,
        name: "Apex Logistics",
        address: "1400 W Madison St, Chicago, IL 60607",
        employeeCount: 890,
        budget: 28_000_000,
    },
    {
        id: 4,
        name: "Stellar Media Group",
        address: "75 Broadway, New York, NY 10006",
        employeeCount: 75,
        budget: 1_800_000,
    },
    {
        id: 5,
        name: "Horizon Healthcare",
        address: "10 Longwood Ave, Boston, MA 02115",
        employeeCount: 320,
        budget: 15_000_000,
    },
];

export default function CompaniesPage() {
    return (
        <div>
            <h1>Companies</h1>
            {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
            ))}
        </div>
    );
}
