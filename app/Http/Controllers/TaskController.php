<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('tasks/index', [
            'tasks' => $request->user()
                ->tasks()
                ->orderBy('completed')
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'due_date' => ['nullable', 'date'],
        ]);

        $request->user()->tasks()->create($data);

        return to_route('tasks.index');
    }

    public function update(Request $request, Task $task): RedirectResponse
    {
        abort_unless($task->user()->is($request->user()), 403);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'due_date' => ['nullable', 'date'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $task->update($data);

        return to_route('tasks.index');
    }

    public function destroy(Request $request, Task $task): RedirectResponse
    {
        abort_unless($task->user()->is($request->user()), 403);

        $task->delete();

        return to_route('tasks.index');
    }
}
