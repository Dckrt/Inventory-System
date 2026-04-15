useEffect(() => {
  fetch(API + "/income")
    .then(res => res.json())
    .then(setItems);
}, []);

const data = {
  labels: items.map(i => i.date),
  datasets: [
    {
      label: "Daily Income",
      data: items.map(i => i.income)
    }
  ]
};