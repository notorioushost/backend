import prisma from "..";

interface UsedInterface {
	mark: boolean;
	user: string;
}

export class InviteFactory {
	/**
	 * Delete an invite from the database.
	 * @param invite The invite to delete.
	 * @param used If added, instead of deleting the invite it will mark it as used.
	 * @returns If the invite was deleted successfully
	 */
	async delete(invite: string, used?: UsedInterface): Promise<boolean> {
		const result = await prisma.invite.findFirst({
			where: {
				code: {
					equals: invite,
					mode: "insensitive",
				},
			},
		});

		if (!result) return false;

		if (used?.mark) {
			// Mark the invite as used instead of deleting it. Useful for registrations.
			await prisma.invite.update({
				where: {
					code: result.code,
				},
				data: {
					used: true,
					usedBy: used.user,
				},
			});

			return true;
		}

		// Actually delete the invite.
		await prisma.invite.delete({
			where: {
				code: result.code,
			},
		});

		return true;
	}
}
