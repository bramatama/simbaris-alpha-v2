import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { Plus } from 'lucide-react';

type Expertise = {
    expertise_id: number;
    expertise_name: string;
};

type Judge = {
    judge_id: number;
    user?: {
        name: string;
        email: string;
    };
};

interface AddJudgeDialogProps {
    eventPublicId: string;
    userRole: string;
    existingJudges: Judge[];
    expertises: Expertise[];
}

export default function AddJudgeDialog({
    eventPublicId,
    userRole,
    existingJudges,
    expertises,
}: AddJudgeDialogProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<{
            name: string;
            email: string;
            expertise_ids: number[];
            force_create: boolean;
        }>({
            name: '',
            email: '',
            expertise_ids: [],
            force_create: false,
        });

    useEffect(() => {
        if (errors['confirmation' as keyof typeof errors]) {
            setShowConfirm(true);
        }
    }, [errors['confirmation' as keyof typeof errors]]);

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${userRole}/events/${eventPublicId}/judges`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
                setShowConfirm(false);
            },
        });
    };

    const confirmSubmit = () => {
        setShowConfirm(false);
        clearErrors('confirmation' as keyof typeof errors);

        setData('force_create', true);

        post(`/${userRole}/events/${eventPublicId}/judges`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
                setShowConfirm(false);
            },
            onError: (errors) => {
                if (errors.confirmation) {
                    setShowConfirm(true);
                }
            },
            onFinish: () => {
                setData('force_create', false);
            },
        });
    };

    const toggleExpertise = (
        expertiseId: number,
        checked: boolean | 'indeterminate',
    ) => {
        setData(
            'expertise_ids',
            checked === true
                ? [...new Set([...data.expertise_ids, expertiseId])]
                : data.expertise_ids.filter((id) => id !== expertiseId),
        );
    };

    return (
        <>
            <Dialog
                open={isAddOpen}
                onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) {
                        reset();
                        clearErrors();
                        setShowConfirm(false);
                    }
                }}
            >
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Assign New Judge
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <form onSubmit={submitAdd}>
                        <DialogHeader>
                            <DialogTitle >Assign Judge to Event</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="grid gap-2 border-b border-dashed pb-4">
                                <Label className="text-muted-foreground">
                                    Autofill Existing Judge
                                </Label>
                                <Select
                                    onValueChange={(value) => {
                                        const judge = existingJudges.find(
                                            (item) =>
                                                item.judge_id.toString() ===
                                                value,
                                        );
                                        if (judge) {
                                            setData((previous) => ({
                                                ...previous,
                                                name: judge.user?.name ?? '',
                                                email: judge.user?.email ?? '',
                                            }));
                                            clearErrors('name');
                                            clearErrors('email');
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-muted/30">
                                        <SelectValue placeholder="Select an existing judge" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>
                                                Registered Judges
                                            </SelectLabel>
                                            {existingJudges.map((judge) => (
                                                <SelectItem
                                                    key={judge.judge_id}
                                                    value={judge.judge_id.toString()}
                                                >
                                                    {judge.user?.name ??
                                                        'Unnamed Judge'}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-3">
                                <div>
                                    <Label>Judge Expertise</Label>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Select one or more areas of expertise
                                        for this event.
                                    </p>
                                </div>
                                <div className="grid gap-3 rounded-lg border p-3">
                                    {expertises.map((expertise) => (
                                        <label
                                            key={expertise.expertise_id}
                                            htmlFor={`expertise-${expertise.expertise_id}`}
                                            className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                                        >
                                            <Checkbox
                                                id={`expertise-${expertise.expertise_id}`}
                                                checked={data.expertise_ids.includes(
                                                    expertise.expertise_id,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    toggleExpertise(
                                                        expertise.expertise_id,
                                                        checked,
                                                    )
                                                }
                                            />
                                            <span className="text-sm font-medium">
                                                {expertise.expertise_name}
                                            </span>
                                        </label>
                                    ))}
                                    {expertises.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            No expertise data available.
                                        </p>
                                    )}
                                </div>
                                <InputError message={errors.expertise_ids} />
                                <InputError
                                    message={
                                        errors[
                                            'expertise_ids.0' as keyof typeof errors
                                        ]
                                    }
                                />

                                {data.expertise_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {expertises
                                            .filter((expertise) =>
                                                data.expertise_ids.includes(
                                                    expertise.expertise_id,
                                                ),
                                            )
                                            .map((expertise) => (
                                                <Badge
                                                    key={expertise.expertise_id}
                                                    variant="secondary"
                                                >
                                                    {expertise.expertise_name}
                                                </Badge>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    data.expertise_ids.length === 0
                                }
                            >
                                {processing && (
                                    <Spinner className="mr-2 h-4 w-4" />
                                )}
                                Assign Judge
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={showConfirm}
                onOpenChange={(open) => {
                    setShowConfirm(open);
                    if (!open) {
                        clearErrors();
                    }
                }}
                title="Judge Account Found"
                description={
                    errors['confirmation' as keyof typeof errors] as string
                }
                confirmText="Continue Assignment"
                onConfirm={confirmSubmit}
                isProcessing={processing}
            />
        </>
    );
}
