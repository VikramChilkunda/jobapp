export function SkillTags({
  skills,
  variant,
}: {
  skills: string[];
  variant: "match" | "missing";
}) {
  const colors =
    variant === "match"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";

  if (skills.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        {variant === "match" ? "No matching skills found" : "No gaps identified"}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill}
          className={`px-3 py-1 rounded-full text-sm border ${colors}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
