import { useEffect, useState } from "react";
import Left from './Left.jsx';
import Right from './Right.jsx';
import { useLocation } from 'react-router-dom';

export default function List() {
  const { state } = useLocation();
  const params = state;
  const [sortBy, setSortBy] = useState('none');
  const [filter, setFilter] = useState('none');
  useEffect(() => {
  }, [sortBy, filter]);
  return (
    <div>
      <Left setFilter={setFilter} setSortBy={setSortBy} />
      <Right type={params.type} filter={filter} sortBy={sortBy} />
    </div>
  )
}
