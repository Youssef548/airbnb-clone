import Container from "../../Container";
import CategoryBox from "../../CategoryBox";
import { useSearchParams, useLocation } from "react-router-dom";
import { categories } from "../../../constants/categories";

const Categories = () => {
  const [params] = useSearchParams();
  const categoryParam = params?.get("category");
  const { pathname } = useLocation();

  const isMainPage = pathname === "/";

  if (!isMainPage) {
    return null;
  }

  return (
    <Container>
      <div
        className="
        pt-4
        flex
        flex-row
        items-center
        justify-between
        overflow-x-hidden"
      >
        {categories.map((category) => (
          <CategoryBox
            key={category.label}
            label={category.label}
            selected={categoryParam === category.label}
            icon={category.icon}
          />
        ))}
      </div>
    </Container>
  );
};

export default Categories;
