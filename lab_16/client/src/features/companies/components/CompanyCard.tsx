import type { CompanyCardProps } from "../interfaces";

export default function CompanyCard({ company }: CompanyCardProps) {
    const formattedBudget = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(company.budget);

    return (
        <div
            style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
            }}
        >
            <h2>{company.name}</h2>
            <p>ID: {company.id}</p>
            <p>Address: {company.address}</p>
            <p>Employees: {company.employeeCount.toLocaleString()}</p>
            <p>Budget: {formattedBudget}</p>
        </div>
    );
}
