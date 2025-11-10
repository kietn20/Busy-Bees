const QuickLinks = () => {
  const links = [
    { name: "Notes", href: "/notes" },
    { name: "Flashcards", href: "/flashcards" },
    { name: "Events", href: "/events" },
  ];
  return (
    <div>
      <h2>Quick Links</h2>
      {links.map((link) => (
        <div key={link.name}>
          <a href={link.href}>{link.name}</a>
        </div>
      ))}
    </div>
  );
};
export default QuickLinks;
