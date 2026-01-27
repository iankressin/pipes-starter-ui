import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

type ProjectStepProps = {
  projectName: string
  sanitizedName: string
  onProjectNameChange: (name: string) => void
}

export function ProjectStep({ projectName, sanitizedName, onProjectNameChange }: ProjectStepProps) {
  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Give your project a short, memorable name. This will also be used as the folder name when you run the
        generated command.
      </p>
      <div className="space-y-2">
        <Label htmlFor="project-name">Project name</Label>
        <Input
          id="project-name"
          placeholder="market-making-bot"
          value={projectName}
          onChange={(event) => onProjectNameChange(event.target.value)}
        />
        {projectName.trim() && projectName.trim() !== sanitizedName && (
          <p className="text-xs text-muted-foreground">
            Folder name will be: <span className="font-mono text-foreground">{sanitizedName}</span>
          </p>
        )}
      </div>
    </section>
  )
}
