import { useState, useEffect } from "react";
import {
  listProjects,
  createProject,
  deleteProject,
  listProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  type Project,
  type ProjectTask,
} from "../api/projects";
import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardTitle, CardDescription, CardSection } from "../components/ui/Card";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { clsx } from "clsx";

function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Record<number, ProjectTask[]>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await listProjects();
      setProjects(data);
      for (const project of data) {
        loadTasks(project.id);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const loadTasks = async (projectId: number) => {
    try {
      const taskList = await listProjectTasks(projectId);
      setTasks((prev) => ({ ...prev, [projectId]: taskList }));
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      alert("Project name is required");
      return;
    }

    try {
      await createProject({
        name: newProject.name.trim(),
        description: newProject.description.trim() || undefined,
        status: newProject.status as Project["status"],
      });
      setNewProject({ name: "", description: "", status: "active" });
      setShowAddForm(false);
      loadProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project");
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      loadProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project");
    }
  };

  const handleToggleTask = async (task: ProjectTask) => {
    try {
      await updateProjectTask({
        id: task.id,
        done: !task.done,
      });
      loadTasks(task.project_id);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleAddTask = async (projectId: number, title: string) => {
    if (!title.trim()) return;
    try {
      const taskList = tasks[projectId] || [];
      await createProjectTask({
        project_id: projectId,
        title: title.trim(),
        order: taskList.length,
      });
      loadTasks(projectId);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task");
    }
  };

  const handleDeleteTask = async (taskId: number, projectId: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteProjectTask(taskId);
      loadTasks(projectId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        action={{
          label: showAddForm ? "Close" : "Add Project",
          onClick: () => setShowAddForm((v) => !v),
        }}
      />

      {showAddForm && (
        <Card className="space-y-4">
          <div>
            <CardTitle>Add New Project</CardTitle>
            <CardDescription>Create a project workspace with a quick description.</CardDescription>
          </div>

          <CardSection>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Name *</label>
              <input
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Project name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Description</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Project description"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Status</label>
              <select
                value={newProject.status}
                onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </CardSection>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{project.name}</CardTitle>
                <span className="mt-1 inline-flex rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  {project.status}
                </span>
                {project.description && (
                  <CardDescription className="mt-3">
                    {project.description}
                  </CardDescription>
                )}
              </div>
              <button
                onClick={() => handleDeleteProject(project.id)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <CardSection>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Tasks</CardTitle>
                <TaskInput projectId={project.id} onAdd={handleAddTask} />
              </div>
              <div className="space-y-2">
                {(tasks[project.id] || []).map((task) => {
                  const done = task.done;
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="text-slate-400 transition hover:text-primary"
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <span
                        className={clsx(
                          "flex-1 text-sm text-slate-200",
                          done && "line-through opacity-60"
                        )}
                      >
                        {task.title}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(task.id, project.id)}
                        className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-xs text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}

                {(tasks[project.id] || []).length === 0 && (
                  <p className="rounded-xl border border-dashed border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400">
                    No tasks yet. Add the first one above.
                  </p>
                )}
              </div>
            </CardSection>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !showAddForm && (
        <Card className="text-center text-sm text-slate-400">
          No projects yet. Click "Add Project" to get started.
        </Card>
      )}
    </div>
  );
}

function TaskInput({
  projectId,
  onAdd,
}: {
  projectId: number;
  onAdd: (projectId: number, title: string) => void;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    onAdd(projectId, value.trim());
    setValue("");
  };

  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="New task"
        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <button
        onClick={handleSubmit}
        className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
      >
        <Plus className="h-3 w-3" />
        Add
      </button>
    </div>
  );
}

export default ProjectsTab;
