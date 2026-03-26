import Button from "./Buttons";
import Heading from "./Heading";
import { useNavigate } from 'react-router-dom';

interface EmptyState {
  title?: string;
  subtitle?:string;
  showReset?: boolean;
}

const EmptyState: React.FC<EmptyState> = (
  {title =  "No Exact matches", subtitle= "Try changing or removing some of your filters", showReset}
) => {

  let navigate = useNavigate();

  return <div
  className="
  h-[60vh]
  flex
  flex-col
  gap-2
  justify-center
  items-center
  ">
    <Heading center title={title} subTitle={subtitle} />
    <div className="w-48 mt-4">
      {showReset && (
        <Button 
        outline
        label="Remove all filters"
        onClick={() => navigate('/')}
        />
      )}
    </div>
  </div>;
};

export default EmptyState;
