import React, { useCallback } from 'react';
import { Icon } from '@iconify/react';
import {  useSearchParams } from 'react-router-dom';
import queryString from 'qs';

interface CategoryBoxProps {
  label: string;
  description?: string; // Made optional since it's not always used
  selected?: boolean;
  icon: any; // Assuming `IconifyIcon` is the correct type for your icon
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  label,
  description,
  icon,
  selected = false, // Default value for selected
}) => {
  let [params, setSearchParams] = useSearchParams();

  let qs = queryString as any;

  const handleClick = useCallback(() => {
    let currentQuery: Record<string, string | string[]> = {};

    if (params) {
      currentQuery = qs.parse(params.toString()) as any;
    }

    const updatedQuery: Record<string, string | string[]> = {
      ...currentQuery,
      category: label,
    };

    if (params?.get('category')  == label )  {
      delete updatedQuery.category;
    }

    setSearchParams(updatedQuery)

  }, [params, label]);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 p-3 border-b-2 hover:text-neutral-800 transition cursor-pointer ${
        selected ? 'border-b-neutral-800 text-neutral-800' : 'border-transparent text-neutral-500'
      }`}
      onClick={handleClick}
    >
      <Icon icon={icon} style={{ fontSize: '26px' }} />
      <div>{label}</div>
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
};

export default CategoryBox;
