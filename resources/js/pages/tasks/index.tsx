import { Head, router, useForm } from '@inertiajs/react';
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { destroy as tasksDestroy, index as tasksIndex, store as tasksStore, update as tasksUpdate } from '@/routes/tasks';

type Task = {
    id: number;
    title: string;
    notes: string | null;
    due_date: string | null;
    completed: boolean;
    created_at: string;
    updated_at: string;
};

type PageProps = {
    tasks: Task[];
};

function formatDate(iso: string) {
    const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function TaskRow({ task }: { task: Task }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const toggleCompleted = () => {
        router.patch(tasksUpdate(task.id).url, {
            completed: !task.completed,
        }, { preserveScroll: true });
    };

    const remove = () => {
        router.delete(tasksDestroy(task.id).url, {
            preserveScroll: true,
            onSuccess: () => setDeleteOpen(false),
        });
    };

    return (
        <div className="flex items-center gap-3 rounded-lg border border-sidebar-border/70 bg-white p-3 dark:border-sidebar-border dark:bg-neutral-900">
            <button
                type="button"
                onClick={toggleCompleted}
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    task.completed
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-neutral-300 hover:border-green-600 dark:border-neutral-600'
                }`}
                title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
            >
                {task.completed && (
                    <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>

            <div className="min-w-0 flex-1">
                <p className={`truncate font-medium ${task.completed ? 'text-neutral-400 line-through dark:text-neutral-500' : ''}`}>
                    {task.title}
                </p>
                {task.notes && <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">{task.notes}</p>}
                {task.due_date && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <CalendarDays className="size-3" />
                        {formatDate(task.due_date)}
                    </p>
                )}
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Editar tarea">
                        <Pencil className="size-4" />
                    </Button>
                </DialogTrigger>
                <EditTaskDialog task={task} onClose={() => setEditOpen(false)} />
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Eliminar tarea">
                        <Trash2 className="size-4 text-red-600" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Eliminar tarea</DialogTitle>
                        <DialogDescription>
                            ¿Seguro que querés eliminar "{task.title}"? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" variant="destructive" onClick={remove}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function EditTaskDialog({ task, onClose }: { task: Task; onClose: () => void }) {
    const { data, setData, patch, processing, errors } = useForm({
        title: task.title,
        notes: task.notes ?? '',
        due_date: task.due_date ? task.due_date.slice(0, 10) : '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(tasksUpdate(task.id).url, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Editar tarea</DialogTitle>
                <DialogDescription>Modificá los datos de la tarea y guardá los cambios.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor={`edit-title-${task.id}`}>Título</Label>
                    <Input
                        id={`edit-title-${task.id}`}
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        required
                        autoFocus
                    />
                    <InputError message={errors.title} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor={`edit-notes-${task.id}`}>Notas</Label>
                    <Input
                        id={`edit-notes-${task.id}`}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Opcional"
                    />
                    <InputError message={errors.notes} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor={`edit-due-${task.id}`}>Fecha de vencimiento</Label>
                    <Input
                        id={`edit-due-${task.id}`}
                        type="date"
                        value={data.due_date}
                        onChange={(e) => setData('due_date', e.target.value)}
                    />
                    <InputError message={errors.due_date} />
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={processing}>Guardar cambios</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

export default function Tasks({ tasks }: PageProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        notes: '',
        due_date: '',
    });

    const pendientes = tasks.filter((task) => !task.completed);
    const completadas = tasks.filter((task) => task.completed);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(tasksStore().url, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="Mis tareas" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Heading title="Mis tareas" description="Creá, editá y seguí tus tareas pendientes" />

                <form
                    onSubmit={submit}
                    className="grid gap-3 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border md:grid-cols-[1fr_1fr_auto_auto]"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="title">Nueva tarea</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="¿Qué hay que hacer?"
                            required
                        />
                        <InputError message={errors.title} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notas</Label>
                        <Input
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Opcional"
                        />
                        <InputError message={errors.notes} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="due_date">Vencimiento</Label>
                        <Input
                            id="due_date"
                            type="date"
                            value={data.due_date}
                            onChange={(e) => setData('due_date', e.target.value)}
                        />
                        <InputError message={errors.due_date} />
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" disabled={processing}>
                            <Plus className="size-4" />
                            Agregar
                        </Button>
                    </div>
                </form>

                <section className="grid gap-3">
                    <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Pendientes ({pendientes.length})
                    </h2>
                    {pendientes.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-sidebar-border p-6 text-center text-sm text-neutral-500 dark:border-sidebar-border">
                            ¡Bien! No tenés tareas pendientes.
                        </p>
                    ) : (
                        pendientes.map((task) => <TaskRow key={task.id} task={task} />)
                    )}
                </section>

                {completadas.length > 0 && (
                    <section className="grid gap-3">
                        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            Completadas ({completadas.length})
                        </h2>
                        {completadas.map((task) => (
                            <TaskRow key={task.id} task={task} />
                        ))}
                    </section>
                )}
            </div>
        </>
    );
}

Tasks.layout = {
    breadcrumbs: [
        {
            title: 'Tareas',
            href: tasksIndex(),
        },
    ],
};
